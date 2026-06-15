"use client";

import PrMergedTheater from "@/components/showcase/pr-merged-theater";

export default function Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "var(--base-size-24, 1.5rem)",
        backgroundColor: "var(--bgColor-default)",
      }}
    >
      <PrMergedTheater />
    </div>
  );
}
