import { Inter, Outfit, Playfair_Display } from "next/font/google"; // Added Playfair
import "./globals.css";
// Preloader removed (handled in page.js)


import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import { AudioProvider } from "../context/AudioContext"; // <--- 1. NEW IMPORT
import CartDrawer from "../components/CartDrawer";
import AuthDrawer from "../components/AuthDrawer";
import AudioTuner from "../components/AudioTuner"; // <--- 2. NEW IMPORT
import AudioAmbience from "../components/AudioAmbience"; // <--- 3. AUDIO ENGINE
import GlobalBackButton from "../components/GlobalBackButton";
import { TransitionProvider } from "../context/TransitionContext";
import Curtain from "../components/Curtain";
import ScannerCursor from "../components/ScannerCursor";
import SpectralSidebar from "../components/SpectralSidebar";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-google-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" }); // Luxury Serif

export const metadata = {
  title: "The 546 Project",
  description: "Experimental Luxury from the Red Planet. Engineered for survival. 2050.",
  openGraph: {
    title: "The 546 Project",
    description: "Experimental Luxury from the Red Planet.",
    url: "https://the546project.com",
    siteName: "The 546 Project",
    images: [
      {
        url: "/assets/BrowserLogo.svg", // Fallback to logo until real OG image
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The 546 Project",
    description: "Experimental Luxury from the Red Planet.",
    creator: "@Mars_SE2",
    images: ["/assets/BrowserLogo.svg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable} ${playfair.variable} font-courier antialiased bg-white text-black`}>
        <AuthProvider>
          <AudioProvider> {/* <--- 3. WRAP AUDIO PROVIDER */}
            <CartProvider>
              <TransitionProvider>

                {/* GLOBAL UI ELEMENTS */}
                <CartDrawer />
                <AuthDrawer />
                <AudioTuner />
                <AudioAmbience /> {/* Global Procedural Audio Engine */}
                <GlobalBackButton />
                <SpectralSidebar />

                {/* PAGE CONTENT */}
                {children}

                {/* GLOBAL OVERLAYS */}
                <Curtain />
                <ScannerCursor />

              </TransitionProvider>
            </CartProvider>
          </AudioProvider>
        </AuthProvider>

      </body>

    </html>
  );
}