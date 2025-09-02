import React, { useState } from 'react';
import { Part } from '../types';

interface PartFormProps {
  onAddPart: (part: Omit<Part, 'id'>) => void;
}

export const PartForm: React.FC<PartFormProps> = ({ onAddPart }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Part name is required';
    }

    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(quantity)) || Number(quantity) < 0) {
      newErrors.quantity = 'Quantity must be a non-negative number';
    } else if (!Number.isInteger(Number(quantity))) {
      newErrors.quantity = 'Quantity must be a whole number';
    }

    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = 'Price must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onAddPart({
      name: name.trim(),
      quantity: parseInt(quantity),
      price: parseFloat(price)
    });

    // Reset form
    setName('');
    setQuantity('');
    setPrice('');
    setErrors({});
  };

  return (
    <div className="card">
      <h2>Add New Part</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Part Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter part name"
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            min="0"
            step="1"
          />
          {errors.quantity && <div className="error">{errors.quantity}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            min="0"
            step="0.01"
          />
          {errors.price && <div className="error">{errors.price}</div>}
        </div>

        <button type="submit" className="btn btn-primary">
          Add Part
        </button>
      </form>
    </div>
  );
};
