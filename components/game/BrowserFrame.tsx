"use client";

interface BrowserFrameProps {
  screenshotPath: string;
}

export default function BrowserFrame({ screenshotPath }: BrowserFrameProps) {
  return (
    <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
      {/* Browser Chrome */}
      <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="flex-1 ml-4">
          <div className="bg-background/50 rounded px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>example-app.com</span>
          </div>
        </div>
      </div>

      {/* Screenshot */}
      <div className="bg-background aspect-video relative overflow-hidden">
        <img
          src={screenshotPath}
          alt="Target UI"
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23111827' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239CA3AF'%3ETarget UI%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>
    </div>
  );
}

