import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "RAG Chat — AI Document Assistant",
  description:
    "Upload documents and chat with them using AI. Powered by LangChain, FAISS and Groq.",
  openGraph: {
    title: "RAG Chat — AI Document Assistant",
    description: "Upload documents and chat with them using AI. Powered by LangChain, FAISS and Groq.",
    images: ["https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1920&q=80"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "RAG Chat — AI Document Assistant",
    description: "Upload documents and chat with them using AI. Powered by LangChain, FAISS and Groq."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full bg-bg">
      <body
        className={`${inter.className} ${spaceGrotesk.className} h-full bg-bg text-textPrimary antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
