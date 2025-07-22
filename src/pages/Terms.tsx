import Header from "../components/Header";
import Footer from "../components/Footer";

const Terms = () => (
  <>
    <Header totalItemsInCart={0} onCartToggle={() => {}} />
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white/90 rounded-2xl shadow-lg border border-white/50 mb-16">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
        Terms & Conditions
      </h1>
      <ol className="list-decimal ml-6 text-gray-700 space-y-2 mb-4">
        <li>
          Accounts must be registered with accurate, up-to-date information.
        </li>
        <li>
          All prices, offers, and discounts are subject to change without prior
          notice.
        </li>
        <li>
          All purchases are subject to product availability and our return
          policy.
        </li>
        <li>
          Abuse of loyalty tiers, promotions, or services may result in account
          suspension.
        </li>
        <li>By using Smart Shopping, you accept these terms in full.</li>
      </ol>
      <p className="text-gray-500">
        Please review these terms regularly. For questions, contact{" "}
        <a href="/support" className="text-blue-600 underline">
          support
        </a>
        .
      </p>
    </div>
    <Footer />
  </>
);
export default Terms;
