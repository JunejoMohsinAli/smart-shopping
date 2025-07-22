import Header from "../components/Header";
import Footer from "../components/Footer";

const Support = () => (
  <>
    <Header totalItemsInCart={0} onCartToggle={() => {}} />
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white/90 rounded-2xl shadow-lg border border-white/50 mb-16">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
        Support & Help Center
      </h1>
      <p className="text-lg text-gray-700 mb-3">
        We're here for you! Get answers fast, or contact our team anytime.
      </p>
      <ul className="list-disc ml-6 text-gray-600 mb-4">
        <li>
          Email:{" "}
          <a
            href="mailto:support@smartshopping.com"
            className="text-blue-600 underline"
          >
            support@smartshopping.com
          </a>
        </li>
        <li>
          Phone:{" "}
          <span className="text-blue-600 font-medium">+1 234 567 890</span>{" "}
          (9am–6pm, Mon–Sat)
        </li>
        <li>Live Chat: Available on all product pages</li>
      </ul>
      <div className="rounded-xl p-4 bg-gradient-to-r from-blue-100 to-purple-100 border text-sm text-gray-700">
        <span className="font-medium">FAQ:</span>
        <ul className="list-disc ml-5 mt-1">
          <li>How do I track my order? — Go to "My Account" &gt; Orders.</li>
          <li>
            How do I apply loyalty discounts? — Make sure you're signed in and
            select your tier on the homepage.
          </li>
          <li>
            How do I return a product? — Use the "Support" section in your order
            details.
          </li>
        </ul>
      </div>
    </div>
    <Footer />
  </>
);
export default Support;
