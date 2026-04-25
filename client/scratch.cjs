const fs = require('fs');

const files = [
  'src/components/InviteGuideModal.tsx',
  'src/components/LocationInput.tsx',
  'src/components/LoginForm.tsx',
  'src/components/RegisterForm.tsx',
  'src/components/ReviewModal.tsx',
  'src/pages/auth/ForgotPasswordPage.tsx',
  'src/pages/auth/ResetPasswordPage.tsx',
  'src/pages/auth/VerifyEmail.tsx',
  'src/pages/guide/GuideEarningsPage.tsx',
  'src/pages/guide/GuideReviewsPage.tsx',
  'src/pages/guide/GuideTripRequestDetailsPage.tsx',
  'src/pages/user/CreateTripPage.tsx',
  'src/pages/user/GalleryPage.tsx',
  'src/pages/user/GuideRegistrationPage.tsx',
  'src/pages/user/KYCPage.tsx',
  'src/pages/user/WeatherPage.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  content = content.replace(/catch \((error|err): any\) \{/g, `catch ($1: unknown) {\n      const errorObj = $1 as { response?: { data?: { message?: string } } };\n      const msg = errorObj.response?.data?.message || 'An unexpected error occurred.';`);
  
  // Specific replacements for toast.error usage
  content = content.replace(/toast\.error\((error|err)\?.response\?.data\?.message \|\| ['"`](.*?)['"`]\)/g, "toast.error(msg || '$2')");
  
  // Save file
  fs.writeFileSync(f, content);
});

console.log("Replaced any -> unknown in catch blocks.");
