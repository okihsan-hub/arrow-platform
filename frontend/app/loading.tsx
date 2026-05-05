import { MarketingPageSkeleton } from "@/components/site/MarketingPageSkeleton";

/** Root page segment — ana sayfa yüklenirken. */
export default function RootLoading() {
  return (
    <div className="min-h-[50vh]">
      <MarketingPageSkeleton variant="default" />
    </div>
  );
}
