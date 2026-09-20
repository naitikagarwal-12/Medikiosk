import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type FacingMode = "user" | "environment";

export interface CameraFeedHandle {
  capture: () => string | null;
  isLive: () => boolean;
}

interface CameraFeedProps {
  facingMode: FacingMode;
  className?: string;
  overlay?: React.ReactNode;
  frozenFrame?: string | null;
  onReady?: () => void;
  onError?: (message: string) => void;
  active?: boolean;
}

const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(
  ({ facingMode, className, overlay, frozenFrame, onReady, onError, active = true }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [live, setLive] = useState(false);

    useImperativeHandle(ref, () => ({
      capture: () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !live) return null;
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.9);
      },
      isLive: () => live,
    }));

    useEffect(() => {
      let cancelled = false;

      async function start() {
        if (!active) return;
        if (!navigator.mediaDevices?.getUserMedia) {
          onError?.("Camera not supported on this device/browser.");
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
          setLive(true);
          onReady?.();
        } catch (err: any) {
          setLive(false);
          onError?.(err?.message || "Unable to access camera.");
        }
      }

      start();

      return () => {
        cancelled = true;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setLive(false);
      };
    }, [facingMode, active]);

    return (
      <div className={className} style={{ position: "relative" }}>
        {frozenFrame ? (
          <img src={frozenFrame} alt="Captured frame" className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
            style={facingMode === "user" ? { transform: "scaleX(-1)" } : undefined}
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        {overlay}
      </div>
    );
  }
);

CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
