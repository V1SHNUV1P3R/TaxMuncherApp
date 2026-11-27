# TaxMuncher

A mobile receipt and sales tax tracking prototype built with Expo SDK 58. The interface uses rust `#A55226`, orange `#D07335`, amber `#DB8A45`, and sand `#ECB36F`, with warm light and dark appearances.

## Run

Use Node 22.13 or newer (Node 24 is supported by the development scripts).

```sh
npm install
npm start
# or: npm run web
```

The app opens to Overview. Without a signed-in account, receipts are saved locally with AsyncStorage. Add receipts manually, attach photos, edit or delete records, search and filter the library, and inspect the Tax summary tab. The optional sample receipts are explicitly labeled and included in local totals. Signing in keeps cloud and local records separate; it does not migrate local receipts.

## Native receipt recognition

`@react-native-ml-kit/text-recognition` provides Google ML Kit OCR, and `expo-dev-client` is installed for development builds. It is loaded only when recognition is requested on native platforms. OCR displays recognized text for review; it does not invent amounts or claim to determine tax eligibility.

```sh
npx expo run:android
# On a Mac with Xcode:
npx expo run:ios
```

These commands generate native projects and require the relevant Android/iOS tooling. Expo Go and web support manual entry and photo attachment; on-device OCR requires a custom native build. Device camera permissions are configured through the Expo ImagePicker plugin. Camera/OCR behavior still needs verification on physical devices.

## Gemini receipt auto-fill

The Expo app sends the receipt photo to the Express backend when a signed-in user selects **Fill with AI**. The backend verifies the Supabase access token, rate-limits requests, accepts one image up to 8 MB, and returns validated receipt fields from Gemini for review.

1. Set `GEMINI_API_KEY` and `GEMINI_MODEL` in `backend/.env`. Use a Gemini model that supports image input and structured output, such as `gemini-3.8-flash`. Keep the API key in the backend environment.
2. Run `npm run backend` from the repo root.
3. Set `EXPO_PUBLIC_RECEIPT_AI_URL=http://localhost:3000/api/receipts/analyze` in the root `.env.local` for local web testing. On a physical phone, replace `localhost` with the backend computer’s LAN IP. Restart Expo after changing the URL. Use HTTPS for a deployed backend.
4. Sign in, attach a sample receipt, and select **Fill with AI**. Review the extracted merchant, date, and amounts before saving.

## Account backend

The existing Supabase integration uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` (or `EXPO_PUBLIC_SUPABASE_ANON_KEY`). With no configured backend, the local prototype still opens. Keys are not logged.

Cloud functionality expects the existing `receipts` table (fields in `src/data/receiptData.tsx`), the case-sensitive `Profiles` table (`id`, `first_name`, `last_name`, `phone_number`), and a `receipt-images` storage bucket. Receipt images retain the existing public URL storage contract. Before storing real receipts, configure appropriate table ownership policies and bucket access; a private bucket with signed URLs is preferable for sensitive documents. No remote schema, policies, data, or bucket settings were changed or verified in this work.

## Tax summary

Totals sum saved sales tax in integer cents to avoid floating point accumulation, with purchase-year and category breakdowns. Additions, edits, and deletions refresh when screens receive focus. CSV text can be shared using the native share sheet. These are tracked sales tax amounts for eligibility review, not guaranteed deductions, tax savings, or refunds. No filing-specific deduction calculation is provided.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo export --platform all
```

Tests cover cent-based totals, year/category filtering, changes to totals after edits/deletion, invalid currency/date input, and malformed AI output. Bundle export verifies compilation, not physical-device camera/OCR, live authentication, database permissions, or live AI behavior.

Reference: [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [Expo Router migration](https://docs.expo.dev/router/migrate/sdk-55-to-56/), [ML Kit wrapper](https://github.com/a7medev/react-native-ml-kit), [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output).

## Previous verification on Expo SDK 57

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: all 5 tests passed.
- `npx expo install --check`: dependencies are up to date for SDK 57.
- `npx expo export --platform all --output-dir dist`: passed for Android, iOS, and web, including all 12 static web routes.
- `npm audit fix`: applied compatible fixes; 15 dependency advisories remain (6 low, 2 moderate, 7 high). No forced major Expo upgrade or downgrade was applied.

These checks do not substitute for visual testing, device camera/OCR tests, or live Supabase and AI integration tests.
