import { Header } from "./Header";
import { Footer } from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-fondo text-carbon">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
