// Service data for both bike and car including detailed pricing and descriptions

export const SERVICES = [
  {
    vehicleType: "bike",
    groups: [
      {
        label: "Tochan 24x7",
        items: [
          {
            value: "tochan-24x7",
            label: "Tochan 24x7",
            description: "24x7 roadside assistance for bikes.",
            price: "Based on distance/requirement"
          }
        ]
      },
      {
        label: "Repairing",
        items: [
          { value: "bike-health-check", label: "₹49 Health Check-up", description: "Basic bike health check-up", price: 49 },
          { value: "bike-general-service", label: "₹99 General Bike Service", description: "General service for bikes", price: 99 },
          { value: "bike-sport-premium-service", label: "₹199 Sport or Premium Bike Service", description: "Service for sport or premium bikes", price: 199 },
          { value: "bike-premium-service", label: "₹299 Premium Service", description: "Premium service for bikes", price: 299 },
          { value: "bike-premium-health", label: "₹399 Premium Service and Health Check-up", description: "Premium service including full check-up", price: 399 },
          { value: "bike-full-service", label: "₹499 Full Service", description: "Complete bike servicing", price: 499 },
          { value: "bike-major-engine", label: "₹999 Major Engine Service", description: "Major engine service", price: 999 },
          { value: "bike-part-renewal", label: "Add-on charges if renewal of part", description: "Extra charges for part renewals", price: "Add-on" }
        ]
      },
      {
        label: "Washing",
        items: [
          { value: "bike-wash-general", label: "₹49 General Wash", description: "Basic washing for bikes", price: 49 },
          { value: "bike-wash-premium", label: "₹99 Premium Wash", description: "Premium bike washing", price: 99 },
          { value: "bike-wash-polish", label: "₹199 Polish and Wash (Tyre Polish)", description: "Washing and tyre polishing", price: 199 },
          { value: "bike-deep-clean-1", label: "₹299 Deep Clean Stage 1", description: "Stage 1 deep cleaning", price: 299 },
          { value: "bike-deep-clean-3", label: "₹499 Deep Clean Stage 3", description: "Stage 3 deep cleaning", price: 499 }
        ]
      },
      {
        label: "Modification",
        items: [
          { value: "bike-dent", label: "Dent Job", description: "Charges based on current bike condition", price: "Varies" },
          { value: "bike-paint", label: "Paint Job", description: "Charges based on current bike condition", price: "Varies" },
          { value: "bike-mod-license", label: "Modification with license", description: "Charges Based on bike condition", price: "Varies" }
        ]
      }
    ]
  },
  {
    vehicleType: "car",
    groups: [
      {
        label: "Tochan 24x7",
        items: [
          {
            value: "car-tochan-24x7",
            label: "Tochan 24x7",
            description: "24x7 roadside assistance for cars.",
            price: "Based on distance/requirement"
          }
        ]
      },
      {
        label: "Washing (Sedan/SUV/Luxury)",
        items: [
          { value: "car-dusting", label: "₹49 Dusting", description: "Basic dusting", price: 49 },
          { value: "car-external-extra", label: "₹99 External Wash Extra", description: "External wash with extra care", price: 99 },
          { value: "car-external-premium", label: "₹199 External Premium Wash", description: "Premium external wash", price: 199 },
          { value: "car-external-polish", label: "₹299 External Wash with Polish", description: "External polish and wash", price: 299 },
          { value: "car-int-ext-wash", label: "₹399 Interior + External Wash", description: "Complete interior and exterior wash", price: 399 },
          { value: "car-wash-polish", label: "₹499 Wash with Polish", description: "Wash with polish", price: 499 },
          { value: "car-premium-polish", label: "₹599 Wash with Premium Polish", description: "Premium polish with wash", price: 599 },
          { value: "car-premium-tyre", label: "₹699 Both Side Premium Service with Tyre Polish", description: "Premium wash and tyre polish", price: 699 },
          { value: "car-deep-clean-1", label: "₹999 Deep Clean Stage 1", description: "Stage 1 deep cleaning", price: 999 },
          { value: "car-deep-clean-3", label: "₹1999 Deep Clean Stage 3", description: "Stage 3 deep cleaning", price: 1999 },
          { value: "car-commercial", label: "₹2999 Commercial Vehicles", description: "Service for commercial vehicles", price: 2999 }
        ]
      },
      {
        label: "Repair",
        items: [
          { value: "car-repair-coming-soon", label: "Repair (Coming Soon)", description: "Car repair services coming soon", price: "-" }
        ]
      },
      {
        label: "Dent, Paint, Modification",
        items: [
          { value: "car-dent-coming-soon", label: "Dent Job – Coming Soon", description: "Car dent repair coming soon", price: "-" },
          { value: "car-paint-coming-soon", label: "Paint Job – Coming Soon", description: "Car paint job coming soon", price: "-" },
          { value: "car-mod-license-coming-soon", label: "Modification with License - (Coming Soon)", description: "Modification service coming soon", price: "-" }
        ]
      },
      {
        label: "PPF & Ceramic Coating",
        items: [
          { value: "car-ppf-ceramic", label: "PPF & Ceramic Coating", description: "Charges Based on current condition", price: "Varies" }
        ]
      }
    ]
  }
];
