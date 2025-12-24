import React from 'react';

const ServiceCard = ({ service, onSelect, isSelected }) => {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 
        ${isSelected ? 'border-amber-500 bg-amber-900/20' : 'border-slate-700 hover:border-amber-500'}`}
      onClick={() => onSelect(service)}
    >
      <h3 className="text-xl font-semibold text-amber-300">{service.name}</h3>
      <p className="text-slate-400 mt-1">{service.description}</p>
      <p className="text-lg font-bold text-white mt-2">${service.price}</p>
    </div>
  );
};

export default ServiceCard;
