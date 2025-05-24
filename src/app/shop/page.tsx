"use client";

import React, { useEffect, useState } from "react";
import styles from "./shop.module.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  imageurl: string; // Note: Supabase column is likely "imageurl"
  description?: string;
}

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        setProducts([]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <section className={styles.introSection}>
          <div className={styles.introContainer}>
            <h1>Welcome to the Satish Garage Shop</h1>
            <p>
              Discover premium car care products and accessories, handpicked for quality and value.<br />
              Shop confidently with Satish Garage – where performance meets reliability.
            </p>
          </div>
        </section>
        <div className={styles.container}>
          <h2 className={styles.productsTitle}>Shop Products</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products yet. Please check back later!</p>
          ) : (
            <div className={styles.grid}>
              {products.map(product => (
                <div key={product.id} className={styles.card}>
                  <img src={product.imageurl} alt={product.name} className={styles.image} />
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.description}>
                    {product.description || <span style={{ opacity: 0.5 }}>No description</span>}
                  </p>
                  <strong className={styles.price}>₹{product.price}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShopPage;