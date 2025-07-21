import { CreditCard } from "lucide-react";

const CheckoutPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-green-100">
        <CreditCard className="w-10 h-10 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600 mb-6">
          This is a placeholder checkout page. You can implement payment flow
          here.
        </p>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 shadow-md">
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
