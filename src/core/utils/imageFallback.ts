/**
 * High-resolution fallback food images from Unsplash
 * Used whenever backend image URLs are dummy, missing, or 404
 */
export const getFoodImageFallback = (itemName: string = '', categoryName: string = ''): string => {
  const query = `${itemName} ${categoryName}`.toLowerCase();

  if (query.includes('biryani') || query.includes('rice') || query.includes('pulao')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('burger') || query.includes('slider')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('chai') || query.includes('tea') || query.includes('kulhad')) {
    return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('coffee') || query.includes('cappuccino') || query.includes('espresso') || query.includes('latte')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('shake') || query.includes('smoothie')) {
    return 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('mojito') || query.includes('cooler') || query.includes('mocktail') || query.includes('drink')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('paneer') || query.includes('curry') || query.includes('subz')) {
    return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('cake') || query.includes('dessert') || query.includes('sweet') || query.includes('ice cream')) {
    return 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('sandwich') || query.includes('toast')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80';
  }

  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
};
