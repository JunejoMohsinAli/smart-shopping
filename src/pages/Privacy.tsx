import Header from "../components/Header";
import Footer from "../components/Footer";

const Privacy = () => (
  <>
    <Header totalItemsInCart={0} onCartToggle={() => {}} />
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white/90 rounded-2xl shadow-lg border border-white/50 mb-16">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
        Privacy Policy
      </h1>
      <p className="text-gray-700 mb-4">
        Your privacy and trust are our top priorities at Smart Shopping. We only
        collect the data necessary to process your orders and enhance your
        experience.
      </p>
      <ul className="list-disc ml-6 text-gray-600 mb-3">
        <li>
          We never sell or share your personal information with third parties.
        </li>
        <li>All payments are processed via secure, encrypted connections.</li>
        <li>You can update or delete your account data at any time.</li>
      </ul>
      <p className="text-gray-500">
        Questions? Contact our{" "}
        <a href="/support" className="text-blue-600 underline">
          support team
        </a>
        . See our full{" "}
        <span className="font-medium text-purple-600">privacy statement</span>{" "}
        in your account settings.
      </p>
    </div>
    <Footer />
  </>
);
export default Privacy;
