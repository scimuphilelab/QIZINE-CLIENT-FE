import type { MongoMenuDocument } from '../types/menu.types';

export const SAMPLE_MENU: MongoMenuDocument = {
  cafe_id: "cafe_7kJ2n9Xm4Pq1L8wZ",
  menu_id: "menu_main_v1",
  schema_version: 2,
  status: "ACTIVE",
  cafe_profile: {
    name: "FAUGET BURGER",
    tagline: "Good Food. Better Moods.",
    logo_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80",
    cover_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
    phone: "+919876543210",
    address: "Baker Street, Downtown",
    google_map_link: "https://maps.google.com/?q=Baker+Street+Downtown",
    currency: "INR",
    currency_symbol: "₹",
    socials: {
      instagram: "https://instagram.com/faugetburger",
      whatsapp: "+919876543210"
    }
  },
  design_config: {
    template_id: "tpl_modern_01",
    colors: {
      primary: "#181615",
      secondary: "#8E8276",
      accent: "#D9534F",
      background: "#F5EBE1",
      surface: "#FFFDF9",
      text: "#181615",
      text_muted: "#7E756B"
    },
    fonts: {
      heading: "playfair_display",
      body: "inter"
    },
    options: {}
  },
  settings: {
    ordering_enabled: true,
    waiter_call_enabled: true,
    show_search_bar: true,
    show_diet_filter: true,
    tax_rate_percent: 5.0,
    service_charge_percent: 0.0,
    estimated_prep_time_minutes: 20
  },
  sections: [
    {
      id: "sec_main",
      name: "Main Menu",
      tagline: "Fresh ingredients. Juicy bites. Only the best.",
      sort_order: 1,
      is_active: true,
      categories: [
        {
          id: "cat_burgers",
          name: "Burgers",
          description: "Fresh ingredients. Juicy bites. Only the best.",
          image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
          sort_order: 1,
          is_active: true,
          items: [
            {
              id: "itm_classic_cheeseburger",
              name: "Classic Cheeseburger",
              short_name: "Cheeseburger",
              description: "Juicy patty, fresh lettuce, tomato, onion, special sauce.",
              diet_type: "NON_VEG",
              spice_level: 1,
              prep_time_minutes: 15,
              pricing_type: "FLAT",
              base_price_paise: 10500,
              images: [
                {
                  url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
                  alt: "Classic Cheeseburger"
                }
              ],
              addon_groups: [
                {
                  id: "grp_extras",
                  title: "Customize (Optional)",
                  min_selection: 0,
                  max_selection: 4,
                  addons: [
                    { id: "add_cheese", name: "Add extra cheese", price_paise: 1500, in_stock: true },
                    { id: "add_bacon", name: "Add bacon", price_paise: 2000, in_stock: true },
                    { id: "add_patty", name: "Extra patty", price_paise: 3500, in_stock: true },
                    { id: "add_jalapeno", name: "Jalapeños", price_paise: 1000, in_stock: true }
                  ]
                }
              ],
              tags: ["Popular", "Bestseller"]
            },
            {
              id: "itm_bacon_cheeseburger",
              name: "Bacon Cheeseburger",
              short_name: "Bacon Burger",
              description: "Crispy bacon, cheese, lettuce, tomato, special sauce.",
              diet_type: "NON_VEG",
              spice_level: 1,
              prep_time_minutes: 15,
              pricing_type: "FLAT",
              base_price_paise: 12500,
              images: [
                {
                  url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80",
                  alt: "Bacon Cheeseburger"
                }
              ],
              addon_groups: [
                {
                  id: "grp_extras",
                  title: "Customize (Optional)",
                  min_selection: 0,
                  max_selection: 4,
                  addons: [
                    { id: "add_cheese", name: "Add extra cheese", price_paise: 1500, in_stock: true },
                    { id: "add_patty", name: "Extra patty", price_paise: 3500, in_stock: true }
                  ]
                }
              ],
              tags: ["Chef Special"]
            },
            {
              id: "itm_mushroom_swiss",
              name: "Mushroom Swiss",
              short_name: "Mushroom Swiss",
              description: "Grilled mushrooms, Swiss cheese, lettuce, tomato.",
              diet_type: "VEG",
              spice_level: 1,
              prep_time_minutes: 12,
              pricing_type: "FLAT",
              base_price_paise: 11500,
              images: [
                {
                  url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
                  alt: "Mushroom Swiss Burger"
                }
              ],
              tags: ["Veg Delight"]
            },
            {
              id: "itm_double_patty_burger",
              name: "Double Patty Burger",
              short_name: "Double Patty",
              description: "Two juicy patties, double cheese, lettuce, tomato, special sauce.",
              diet_type: "NON_VEG",
              spice_level: 2,
              prep_time_minutes: 18,
              pricing_type: "FLAT",
              base_price_paise: 15500,
              images: [
                {
                  url: "https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?auto=format&fit=crop&w=600&q=80",
                  alt: "Double Patty Burger"
                }
              ],
              tags: ["Hunger Buster"]
            }
          ]
        },
        {
          id: "cat_appetizers",
          name: "Appetizers",
          description: "Crispy crunches and savory warm sides.",
          image_url: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80",
          sort_order: 2,
          is_active: true,
          items: [
            {
              id: "itm_loaded_cheddar_soup",
              name: "Loaded Cheddar Soup",
              short_name: "Cheddar Soup",
              description: "Warm rich cheddar loaded with toppings and crispy crunches.",
              diet_type: "VEG",
              prep_time_minutes: 10,
              pricing_type: "FLAT",
              base_price_paise: 9500,
              images: [
                {
                  url: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
                  alt: "Loaded Cheddar Soup"
                }
              ],
              tags: ["Popular"]
            },
            {
              id: "itm_crispy_fries",
              name: "Crispy Golden Fries",
              short_name: "French Fries",
              description: "Hand-cut Idaho potatoes fried golden with sea salt & herb dust.",
              diet_type: "VEG",
              prep_time_minutes: 8,
              pricing_type: "FLAT",
              base_price_paise: 8500,
              images: [
                {
                  url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
                  alt: "Crispy Fries"
                }
              ]
            }
          ]
        },
        {
          id: "cat_milkshakes",
          name: "Milkshakes",
          description: "Creamy hand-spun milkshakes with rich toppings.",
          image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
          sort_order: 3,
          is_active: true,
          items: [
            {
              id: "itm_chocolate_milkshake",
              name: "Chocolate Milkshake",
              short_name: "Choco Shake",
              description: "Decadent Dutch cocoa blended with vanilla cream & chocolate curl garnish.",
              diet_type: "VEG",
              prep_time_minutes: 8,
              pricing_type: "FLAT",
              base_price_paise: 9500,
              images: [
                {
                  url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
                  alt: "Chocolate Milkshake"
                }
              ],
              tags: ["Bestseller"]
            }
          ]
        },
        {
          id: "cat_drinks",
          name: "Drinks",
          description: "Chilled refreshers, craft sodas and iced teas.",
          image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80",
          sort_order: 4,
          is_active: true,
          items: [
            {
              id: "itm_iced_americano",
              name: "Iced Americano",
              short_name: "Iced Coffee",
              description: "Double shot espresso over ice water.",
              diet_type: "VEG",
              prep_time_minutes: 5,
              pricing_type: "FLAT",
              base_price_paise: 7500,
              images: [
                {
                  url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
                  alt: "Iced Americano"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
