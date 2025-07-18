const Footer = () => {
  return (
    <footer className="w-full bg-black text-gray-400 py-10">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div className="flex flex-col space-y-2">
            <a href="#" className="hover:underline">Audio and Subtitles</a>
            <a href="#" className="hover:underline">Media Center</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Contact Us</a>
          </div>
          <div className="flex flex-col space-y-2">
            <a href="#" className="hover:underline">Audio Description</a>
            <a href="#" className="hover:underline">Investor Relations</a>
            <a href="#" className="hover:underline">Legal Notices</a>
          </div>
          <div className="flex flex-col space-y-2">
            <a href="#" className="hover:underline">Help Center</a>
            <a href="#" className="hover:underline">Jobs</a>
            <a href="#" className="hover:underline">Cookie Preferences</a>
          </div>
          <div className="flex flex-col space-y-2">
            <a href="#" className="hover:underline">Gift Cards</a>
            <a href="#" className="hover:underline">Terms of Use</a>
            <a href="#" className="hover:underline">Corporate Information</a>
          </div>
        </div>
        <div className="mt-10 text-xs text-gray-500">
          <p>© 2025 YourStreamingService, Inc.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
