export function getIngredients(name: string, categoryName: string): string[] {
  const n = name.toLowerCase();
  const cat = categoryName.toLowerCase();

  // Helper to check if string contains any of the keywords
  const has = (keywords: string[]) => keywords.some(k => n.includes(k));

  // 1. Pizza Category
  if (cat.includes('pizza') || has(['pizza'])) {
    if (n.includes('sandwich')) {
      // Open Pizza Sandwich
      const ingredients = ['Bread slice', 'Pizza sauce', 'Mozzarella cheese', 'Capsicum', 'Onion', 'Oregano', 'Chilli flakes'];
      if (has(['burst'])) ingredients.push('Liquid cheese');
      return ingredients;
    }
    const ingredients = ['Pizza dough', 'Pizza sauce', 'Mozzarella cheese', 'Oregano', 'Chilli flakes'];
    if (has(['paneer'])) ingredients.push('Paneer cubes');
    if (has(['corn'])) ingredients.push('Sweet corn');
    if (has(['onion'])) ingredients.push('Red onions');
    if (has(['capsicum'])) ingredients.push('Green capsicum');
    if (has(['spicy', 'chilli'])) ingredients.push('Jalapeños');
    if (has(['tandoori'])) ingredients.push('Tandoori sauce');
    if (has(['farmhouse'])) {
      ingredients.push('Mushroom');
      ingredients.push('Onion');
      ingredients.push('Capsicum');
      ingredients.push('Tomato');
    }
    if (has(['mexican'])) {
      ingredients.push('Jalapeños');
      ingredients.push('Sweet corn');
      ingredients.push('Capsicum');
    }
    if (has(['peppy'])) {
      ingredients.push('Paneer cubes');
      ingredients.push('Capsicum');
      ingredients.push('Red paprika');
    }
    if (has(['extra vegetable'])) {
      ingredients.push('Onions');
      ingredients.push('Capsicum');
      ingredients.push('Sweet corn');
      ingredients.push('Tomatoes');
    }
    if (has(['extra cheese'])) {
      ingredients.push('Extra Cheddar cheese');
    }
    // Remove duplicates
    return Array.from(new Set(ingredients));
  }

  // 2. Burger Category
  if (cat.includes('burger') || has(['burger'])) {
    const ingredients = ['Burger bun', 'Lettuce', 'Tomato slices', 'Burger mayonnaise'];
    if (has(['paneer'])) {
      ingredients.push('Paneer patty');
    } else {
      ingredients.push('Crispy aloo tikki patty');
    }
    if (has(['cheese'])) ingredients.push('Cheddar cheese slice');
    if (has(['double'])) ingredients.push('Extra cheese slice');
    if (has(['tandoori'])) ingredients.push('Tandoori sauce');
    if (has(['makhani'])) ingredients.push('Makhani sauce');
    return Array.from(new Set(ingredients));
  }

  // 3. Samosa Category
  if (cat.includes('samosa') || has(['samosa'])) {
    const ingredients = ['Maida (flour)', 'Potato stuffing', 'Green peas', 'Indian spices', 'Cooking oil'];
    if (has(['cheese'])) ingredients.push('Processed cheese');
    if (has(['mayo'])) ingredients.push('Mayonnaise');
    if (has(['chilli'])) ingredients.push('Green chillies');
    if (has(['corn'])) ingredients.push('Sweet corn');
    if (has(['paneer'])) ingredients.push('Paneer pieces');
    if (has(['tandoori'])) ingredients.push('Tandoori dressing');
    return Array.from(new Set(ingredients));
  }

  // 4. French Fries Category
  if (cat.includes('fries') || has(['fries', 'french fries'])) {
    const ingredients = ['Potatoes', 'Vegetable oil', 'Salt'];
    if (has(['peri peri'])) ingredients.push('Peri peri spice mix');
    if (has(['masala'])) ingredients.push('Chaat masala');
    if (has(['cheese'])) ingredients.push('Liquid cheese sauce');
    return Array.from(new Set(ingredients));
  }

  // 5. Sandwich / Club Sandwich Category
  if (cat.includes('sandwich') || has(['sandwich'])) {
    const ingredients = ['Bread slices', 'Butter', 'Green mint chutney'];
    if (has(['bombay', 'kaccha', 'vegetable', 'veg', 'club', 'supreme'])) {
      ingredients.push('Cucumber slices');
      ingredients.push('Tomato slices');
      ingredients.push('Potato slices');
      ingredients.push('Onion rings');
      ingredients.push('Sandwich masala');
    }
    if (has(['cheese'])) ingredients.push('Grated Cheddar cheese');
    if (has(['masala'])) {
      ingredients.push('Spiced potato filling');
      ingredients.push('Chaat masala');
    }
    if (has(['chilli'])) ingredients.push('Green chillies');
    if (has(['chutney'])) ingredients.push('Tamarind chutney');
    if (has(['mayo'])) ingredients.push('Mayonnaise');
    if (has(['paneer'])) ingredients.push('Spiced paneer cubes');
    if (has(['tandoori'])) ingredients.push('Tandoori sandwich spread');
    if (has(['garlic'])) {
      ingredients.push('Garlic paste');
      ingredients.push('Garlic butter');
    }
    if (has(['jain'])) {
      // Jain sandwich doesn't use potato/onion
      const jainIngs = ['Bread slices', 'Butter', 'Green mint chutney', 'Tomato slices', 'Cucumber slices', 'Capsicum'];
      if (has(['cheese'])) jainIngs.push('Grated cheese');
      return jainIngs;
    }
    return Array.from(new Set(ingredients));
  }

  // 6. Pasta Category
  if (cat.includes('pasta') || has(['pasta'])) {
    const ingredients = ['Penne pasta', 'Olive oil', 'Garlic', 'Italian seasoning'];
    if (has(['red'])) {
      ingredients.push('Tomato sauce');
      ingredients.push('Basil');
    } else if (has(['white'])) {
      ingredients.push('Heavy cream');
      ingredients.push('Parmesan cheese');
      ingredients.push('Butter');
    } else {
      // Mixed/Veg/Special
      ingredients.push('Tomato-cream mix sauce');
      ingredients.push('Capsicum');
      ingredients.push('Baby corn');
      ingredients.push('Black olives');
    }
    return Array.from(new Set(ingredients));
  }

  // 7. Momos Category
  if (cat.includes('momo') || has(['momo', 'momos'])) {
    const ingredients = ['Refined flour dough', 'Cabbage', 'Carrot', 'Onion', 'Ginger-garlic paste', 'Soy sauce', 'Spices'];
    if (has(['paneer'])) {
      ingredients.push('Paneer stuffing');
      // remove cabbage/carrot to make it paneer-centric
      const idx = ingredients.indexOf('Cabbage');
      if (idx > -1) ingredients.splice(idx, 1);
      const idx2 = ingredients.indexOf('Carrot');
      if (idx2 > -1) ingredients.splice(idx2, 1);
    }
    if (has(['corn'])) ingredients.push('Sweet corn');
    if (has(['cheese'])) ingredients.push('Processed cheese');
    if (has(['tandoori'])) {
      ingredients.push('Yogurt marinade');
      ingredients.push('Tandoori spices');
    }
    if (has(['fried'])) {
      ingredients.push('Oil (for frying)');
    }
    return Array.from(new Set(ingredients));
  }

  // 8. Vada Pav Category
  if (cat.includes('vada') || has(['vada pav'])) {
    const ingredients = ['Pav bread roll', 'Potato vada (patty)', 'Green chilli chutney', 'Sweet tamarind chutney', 'Dry garlic chutney'];
    if (has(['cheese'])) ingredients.push('Cheese slice');
    if (has(['schezwan'])) ingredients.push('Schezwan sauce');
    if (has(['tandoori'])) ingredients.push('Tandoori sauce');
    if (has(['masala'])) ingredients.push('Special masala spice');
    return Array.from(new Set(ingredients));
  }

  // 9. Pav Bhaji Category
  if (cat.includes('pav bhaji') || has(['pav bhaji', 'bhaji'])) {
    if (n === 'extra pav') return ['Pav bread rolls', 'Butter'];
    if (n === 'extra bhaji') return ['Mashed vegetables', 'Pav bhaji masala', 'Butter', 'Onions', 'Lemon'];
    const ingredients = ['Mashed mixed vegetables', 'Pav bhaji masala', 'Amul butter', 'Pav bread rolls', 'Onions', 'Lemon juice'];
    if (has(['cheese'])) ingredients.push('Grated cheese');
    if (has(['paneer'])) ingredients.push('Paneer cubes');
    return Array.from(new Set(ingredients));
  }

  // 10. Chole Bhature & Corn Category
  if (cat.includes('chole') || has(['chole', 'bhature'])) {
    if (n === 'extra bhature') return ['Bhatura dough', 'Oil (for frying)'];
    if (n === 'extra chole') return ['Chickpeas (Kabuli Chana)', 'Onion-tomato gravy', 'Indian spices'];
    return ['Chickpeas (Chole)', 'All-purpose flour dough (Bhatura)', 'Onions', 'Ginger-garlic paste', 'Indian spices', 'Yogurt', 'Oil'];
  }
  if (has(['corn'])) {
    const ingredients = ['Sweet corn kernels', 'Butter', 'Lemon juice', 'Chaat masala'];
    if (has(['crispy'])) {
      ingredients.push('Corn flour');
      ingredients.push('Rice flour');
      ingredients.push('Spring onions');
      ingredients.push('Oil (for frying)');
    }
    return Array.from(new Set(ingredients));
  }

  // 11. Chinese Category
  if (cat.includes('chinese') || has(['noodles', 'rice', 'manchurian', 'pulao'])) {
    if (has(['noodles'])) {
      const ingredients = ['Noodles', 'Cabbage', 'Carrots', 'Capsicum', 'Onions', 'Soy sauce', 'Vinegar', 'Chilli sauce', 'Garlic'];
      if (has(['schezwan'])) ingredients.push('Schezwan sauce');
      if (has(['manchurian'])) ingredients.push('Manchurian balls');
      return Array.from(new Set(ingredients));
    }
    if (has(['rice', 'pulao'])) {
      const ingredients = ['Basmati rice', 'Carrots', 'French beans', 'Spring onions', 'Soy sauce', 'Garlic'];
      if (has(['paneer'])) ingredients.push('Paneer cubes');
      if (has(['schezwan'])) ingredients.push('Schezwan sauce');
      if (has(['manchurian'])) ingredients.push('Manchurian balls');
      if (has(['makhani'])) ingredients.push('Makhani gravy');
      return Array.from(new Set(ingredients));
    }
    if (has(['manchurian'])) {
      return ['Cabbage balls', 'Corn flour', 'Ginger-garlic paste', 'Soy sauce', 'Spring onions', 'Chilli paste', 'Refined oil'];
    }
    if (has(['chilli paneer'])) {
      return ['Paneer cubes', 'Capsicum', 'Onions', 'Soy sauce', 'Green chillies', 'Spring onions', 'Corn starch'];
    }
  }

  // 12. Mojito Category
  if (cat.includes('mojito') || has(['mojito', 'cooler'])) {
    const ingredients = ['Soda water', 'Fresh mint leaves', 'Lemon wedges', 'Sugar syrup', 'Ice cubes'];
    if (has(['mint'])) ingredients.push('Lemon juice');
    if (has(['blue lagoon', 'blue currant'])) ingredients.push('Blue curaçao syrup');
    if (has(['strawberry'])) ingredients.push('Strawberry crush');
    if (has(['mango'])) ingredients.push('Mango puree');
    if (has(['kiwi'])) ingredients.push('Kiwi fruit crush');
    return Array.from(new Set(ingredients));
  }

  // 13. Tea Category
  if (cat.includes('tea') || has(['tea', 'chai'])) {
    const ingredients = ['Milk', 'Water', 'Tea leaves', 'Sugar'];
    if (has(['masala'])) {
      ingredients.push('Cardamom');
      ingredients.push('Ginger');
      ingredients.push('Cloves');
      ingredients.push('Black pepper');
    }
    if (has(['elaichi'])) ingredients.push('Cardamom pods');
    if (has(['ginger'])) ingredients.push('Crushed fresh ginger');
    if (has(['chocolate'])) {
      ingredients.push('Cocoa powder');
      ingredients.push('Chocolate syrup');
    }
    return Array.from(new Set(ingredients));
  }

  // 14. Masala Drinks Category
  if (cat.includes('masala') && has(['cola', 'lemonade'])) {
    const base = ['Lemon juice', 'Black salt', 'Roasted cumin powder', 'Chaat masala', 'Sugar'];
    if (has(['cola'])) {
      base.unshift('Cola beverage');
    } else if (has(['soda'])) {
      base.unshift('Soda water');
    } else {
      base.unshift('Purified water');
    }
    return base;
  }

  // 15. Coffee & Brownie Category
  if (cat.includes('coffee') || cat.includes('brownie') || has(['coffee', 'brownie'])) {
    if (has(['brownie'])) {
      const ingredients = ['Chocolate brownie', 'Chocolate sauce'];
      if (has(['ice cream'])) ingredients.push('Vanilla ice cream');
      if (has(['coffee'])) {
        ingredients.push('Milk');
        ingredients.push('Coffee powder');
      }
      return ingredients;
    }
    if (has(['hot'])) {
      const ingredients = ['Milk', 'Premium coffee powder', 'Sugar'];
      if (has(['chocolate'])) ingredients.push('Chocolate syrup');
      return ingredients;
    }
    if (has(['cold'])) {
      const ingredients = ['Chilled milk', 'Coffee powder', 'Sugar', 'Ice cubes'];
      if (has(['ice cream'])) ingredients.push('Vanilla ice cream');
      if (has(['chocolate'])) ingredients.push('Chocolate syrup');
      return ingredients;
    }
  }

  // 16. Milkshakes & Lassi Category
  if (cat.includes('shake') || cat.includes('lassi') || has(['shake', 'lassi'])) {
    if (has(['lassi'])) {
      return ['Fresh yogurt (Dahi)', 'Sugar', 'Cardamom powder', 'Ice cubes', 'Rose water'];
    }
    const ingredients = ['Milk', 'Vanilla ice cream', 'Sugar'];
    if (has(['vanilla'])) ingredients.push('Vanilla extract');
    if (has(['mango'])) ingredients.push('Mango pulp');
    if (has(['chocolate'])) {
      ingredients.push('Chocolate syrup');
      ingredients.push('Cocoa powder');
    }
    if (has(['butterscotch'])) {
      ingredients.push('Butterscotch syrup');
      ingredients.push('Butterscotch crunchies');
    }
    if (has(['oreo'])) {
      ingredients.push('Oreo cookies');
      ingredients.push('Chocolate drizzle');
    }
    if (has(['strawberry'])) ingredients.push('Strawberry syrup');
    if (has(['kitkat'])) {
      ingredients.push('Kitkat chocolate pieces');
      ingredients.push('Chocolate sauce');
    }
    if (has(['brownie'])) {
      ingredients.push('Fudge brownie bits');
      ingredients.push('Chocolate sauce');
    }
    if (has(['black currant'])) {
      ingredients.push('Black currant syrup');
      ingredients.push('Dried black currants');
    }
    if (has(['dry fruit'])) {
      ingredients.push('Almonds');
      ingredients.push('Cashews');
      ingredients.push('Pistachios');
      ingredients.push('Saffron');
    }
    return Array.from(new Set(ingredients));
  }

  // Fallback / default ingredients
  return ['Fresh local ingredients', 'House special spice blend', 'Butter', 'Salt'];
}
