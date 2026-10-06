# Freshora – PART 5 (Login / Signup / Onboarding / Splash)
UI only. No backend, admin, navigation or package changes.

- `components/AuthParts.js` (new): IconField, PasswordField (show/hide), Checkbox, SocialRow (Google/Apple/WhatsApp), MiniToast, AuthHero.
- `screens/Auth.js`: hero image on top with rounded card overlapping; +91 mobile prefix (10 digits, digits only); show/hide password; terms checkbox (required on signup); inline field errors; Forgot password + social buttons are UI only (toast "coming soon").
  Login stays email + password (backend login is email only). Signup sends name, email, phone, password as before.
- `screens/Onboarding.js`: brand + Skip (hidden on last slide), tag/title/sub, 3 feature chips per slide, image, dots + round arrow button; last slide shows the wide "Let's Get Started" button.
- `screens/Splash.js`: added feature row at the bottom, fixed image aspect ratio to the real asset (720x713).
