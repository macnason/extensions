import { Toast, closeMainWindow, showHUD, showToast } from "@raycast/api";
import { BookmarkForm } from "./components/BookmarkForm";
import { useBrowserLink } from "./hooks/useBrowserLink";

const AddBrowserTab = () => {
  const { isLoading, data: browserLinkData } = useBrowserLink();
  const link = browserLinkData?.url;
  const linkSource = browserLinkData?.source;

  return (
    <BookmarkForm
      isLoading={isLoading}
      defaultLink={link}
      linkSource={linkSource}
      onWillSave={() => {
        showToast(Toast.Style.Animated, "Adding Link...");
      }}
      onSaved={async () => {
        await closeMainWindow({ clearRootSearch: true });
        await showHUD("Link added");
      }}
      onError={() => {
        showToast(Toast.Style.Failure, "Error Adding Link");
      }}
    />
  );
};

export default AddBrowserTab;
