import RainbowKitAndWagmiProvider from "./RainbowKitAndWagmiProvider"
import "./globals.css"
import { Inter as FontSans } from "next/font/google"
import Layout from "@/components/shared/Layout"
 
import { cn } from "@/lib/utils"
 
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Durif's minting DApp",
  description: "Durif's minting DApp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <RainbowKitAndWagmiProvider>
          <Layout>
            {children}
          </Layout>
        </RainbowKitAndWagmiProvider>
      </body>
    </html>
  );
}