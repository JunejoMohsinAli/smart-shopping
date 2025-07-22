import Header from "../components/Header";
import Footer from "../components/Footer";

const About = () => (
  <>
    <Header totalItemsInCart={0} onCartToggle={() => {}} />
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white/90 rounded-2xl shadow-lg border border-white/50 mb-16">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
        About Smart Shopping
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        Welcome to{" "}
        <span className="text-blue-600 font-semibold">Smart Shopping</span>,
        where every cart is a smart cart! We blend technology and
        customer-centric design to help you discover, compare, and shop the best
        products at dynamic prices.
      </p>
      <p className="text-gray-500 mb-2">
        Launched in 2024, Smart Shopping was founded with a mission: make online
        shopping faster, fairer, and more rewarding for everyone. Our dynamic
        pricing, real-time stock updates, and loyalty perks mean you always get
        value for your money.
      </p>
      <p className="text-gray-500">
        <strong>Our vision:</strong> To be your favorite online shopping
        companion, saving you time and maximizing your rewards every time you
        shop.
      </p>
    </div>
    <Footer />
  </>
);
export default About;
