"use client";

interface UIPreviewProps {
  html: string;
}

export default function UIPreview({ html }: UIPreviewProps) {
  // Create a complete HTML document with Tailwind CDN
  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      overflow-x: hidden;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
  `.trim();

  return (
    <div className="relative w-full h-96 bg-white rounded-lg overflow-hidden border shadow-inner">
      <iframe
        srcDoc={fullHtml}
        sandbox="allow-same-origin"
        className="w-full h-full"
        title="Generated UI Preview"
      />
    </div>
  );
}

