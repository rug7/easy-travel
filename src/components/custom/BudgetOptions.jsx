import React from "react";

const BudgetOptions = ({ options, translate }) => (
  <div>
    <h3 className="text-xl font-bold text-white mb-2">
      {translate("budgetTitle")}
    </h3>
    <div className="grid grid-cols-3 gap-5">
      {options.map((item) => (
        <div
          key={item.id}
          className="p-4 border rounded-lg hover:shadow-lg bg-gray-700 text-white"
        >
          <h2 className="text-4xl">{item.icon}</h2>
          <h2 className="font-bold mb-2 text-lg">{item.title}</h2>
          <p className="text-sm text-gray-400">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default BudgetOptions;
