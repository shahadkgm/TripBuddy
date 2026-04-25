const fs = require('fs');

function repl(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

// 1. LocationInput
repl('src/components/LocationInput.tsx', 
  /useState<any\[\]>\(\[\]\)/, 
  'useState<{ display_name: string; lat: string; lon: string }[]>([])');
repl('src/components/LocationInput.tsx', 
  /handleSelect = \(suggestion: any\)/, 
  'handleSelect = (suggestion: { display_name: string; lat: string; lon: string })');

// 2. LoginForm & RegisterForm
repl('src/components/LoginForm.tsx', 
  /handleGoogleSuccess = async \(credentialResponse: any\)/, 
  'handleGoogleSuccess = async (credentialResponse: import("@react-oauth/google").CredentialResponse)');
repl('src/components/RegisterForm.tsx', 
  /handleGoogleSuccess = async \(credentialResponse: any\)/, 
  'handleGoogleSuccess = async (credentialResponse: import("@react-oauth/google").CredentialResponse)');

// 3. RequestedTrips
repl('src/components/profile/RequestedTrips.tsx', 
  /\(req\.receiverId as any\)\?\.name/, 
  '(req.receiverId as {name?: string})?.name');

// 4. GuideBookingsPage
repl('src/pages/guide/GuideBookingsPage.tsx', 
  /'all' as any/, 
  "'all' as 'all'");

// 5. GuideEarningsPage
repl('src/pages/guide/GuideEarningsPage.tsx', 
  /const EarningStat = \(\{ label, value, icon, trend, color \}: any\) =>/, 
  'const EarningStat = ({ label, value, icon, trend, color }: {label:string, value:string|number, icon:React.ReactNode, trend?:string, color?:string}) =>');
repl('src/pages/guide/GuideEarningsPage.tsx', 
  /const Clock = \(\{ size, className \}: any\) =>/, 
  'const Clock = ({ size, className }: {size?:number, className?:string}) =>');

// 6. GuideInvitationsPage
repl('src/pages/guide/GuideInvitationsPage.tsx', 
  /useState<any\[\]>\(\[\]\)/, 
  'useState<import("../../interface/ITripdetails").IGuideInvitation[]>([])');

// 7. GuideReviewsPage
repl('src/pages/guide/GuideReviewsPage.tsx', 
  /useState<any\[\]>\(\[\]\)/, 
  'useState<{ rating: number }[]>([])'); // Assuming basic structure for now
repl('src/pages/guide/GuideReviewsPage.tsx', 
  /reduce\(\(acc: number, r: any\)/g, 
  'reduce((acc: number, r: { rating: number })');
repl('src/pages/guide/GuideReviewsPage.tsx', 
  /forEach\(\(r: any\)/g, 
  'forEach((r: { rating: number })');

// 8. CreateTripPage
repl('src/pages/user/CreateTripPage.tsx', 
  /\(L\.Icon\.Default\.prototype as any\)\._getIconUrl/, 
  '(L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: string })._getIconUrl');
repl('src/pages/user/CreateTripPage.tsx', 
  /setMapSuggestions\(data as any\)/, 
  'setMapSuggestions(data as { display_name: string; lat: string; lon: string }[])');

// 9. ExpenseSplitPage
repl('src/pages/user/ExpenseSplitPage.tsx', 
  /useState<any\[\]>\(\[\]\)/, 
  'useState<import("../../interface/ITripdetails").ITrip["members"] | any[]>([])');

// 10. KYCPage
repl('src/pages/user/KYCPage.tsx', 
  /onUploadProgress: \(progressEvent: any\)/, 
  'onUploadProgress: (progressEvent: import("axios").AxiosProgressEvent)');

// 11. KYCStatusPage
repl('src/pages/user/KYCStatusPage.tsx', 
  /useState<any>\(null\)/, 
  'useState<Record<string, unknown> | null>(null)');

// 12. WeatherPage
repl('src/pages/user/WeatherPage.tsx', 
  /icon: any;/, 
  'icon: React.ReactNode;');

console.log("Applied specific fixes");
