const SITE_NAME = "Depredador Plus";

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
};

export const Seo = ({ title, description, path = "/" }: SeoProps) => {
  const siteUrl = import.meta.env.VITE_SITE_URL ?? "http://localhost:5173";
  const url = `${siteUrl}${path}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
    </>
  );
};
