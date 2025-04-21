"use client";

import { useState } from "react";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Learn with pdf</h1>
      {!loaded && <p>Loading App...</p>}
      <iframe
        src="http://localhost:8503"
        width="100%"
        height="100%"
        className="border rounded-lg"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
