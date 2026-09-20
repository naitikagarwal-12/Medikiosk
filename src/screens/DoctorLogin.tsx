import StaffLoginPage from "./StaffLoginPage";

export default function DoctorLogin() {
  return (
    <StaffLoginPage
      role="physician"
      title="Doctor Sign In"
      icon="🩺"
      subtitle="Queue, patients, encounters & AI assessments"
    />
  );
}
