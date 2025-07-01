// src/components/ProductCard.jsx
export default function ProductCard({ product }) {
  return (
    <div className="border rounded-lg shadow-sm p-4 hover:shadow-md transition">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-700 font-medium">{product.price} 円</p>
    </div>
  );
}
