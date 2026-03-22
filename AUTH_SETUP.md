# Google & Apple OAuth Setup

Google and Apple sign-in are wired up in the app. To enable them:

## 1. Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Google** and **Apple**

## 2. Redirect URLs

Under **Authentication** → **URL Configuration**, add these to **Redirect URLs**:

- `http://localhost:8080/auth/callback` (local dev)
- `https://yourdomain.com/auth/callback` (production)

## 3. Google Configuration

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth 2.0 Client ID (Web application)
2. Add **Authorized JavaScript origins**: `http://localhost:8080`, `https://yourdomain.com`
3. Add **Authorized redirect URIs**: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Find this URL in Supabase: Providers → Google → Redirect URL
4. Copy Client ID and Client Secret into Supabase **Google** provider settings

## 4. Apple Configuration

1. In [Apple Developer](https://developer.apple.com/account), create a **Sign in with Apple** identifier
2. Create a **Services ID** and enable "Sign in with Apple"
3. Add your callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Create a **Key** for Sign in with Apple and download the `.p8` file
5. In Supabase **Apple** provider: add Services ID, Key ID, Team ID, and the private key from the `.p8` file
