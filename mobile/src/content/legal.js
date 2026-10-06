// F1: plain draft text for the Home footer pages. Every page ends with FOOTER_NOTE.
// Have these reviewed before launch (company name, address, retention periods, jurisdiction).
export const FOOTER_NOTE = 'Draft - have it reviewed before launch';

export const PAGES = {
  about: {
    title: 'About Us',
    sections: [
      { h: 'Who we are', p: 'Freshora is a grocery and daily-essentials delivery service. We bring fresh fruits, vegetables, dairy, pantry staples and household items to your door in minutes.' },
      { h: 'What we care about', p: 'Fresh and quality-checked products, fair prices, clear delivery times and friendly support. If something is not right, we want to hear about it.' },
      { h: 'How it works', p: 'Pick your products, choose a delivery address and a payment method, and place your order. You can follow its status from the Orders tab until it reaches you.' },
    ],
  },
  contact: {
    title: 'Contact',
    sections: [
      { h: 'We are here to help', p: 'For questions about an order, delivery or your account, write to us and mention your order ID if it is about an order. We usually reply within one working day.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      { h: 'What we collect', p: 'Your name, e-mail, phone number, delivery addresses and order history, so that we can create your account and deliver your orders.' },
      { h: 'How we use it', p: 'To process and deliver orders, to show your order status, to give support, and to send service messages. We do not sell your personal data.' },
      { h: 'Passwords and security', p: 'Passwords are stored only as one-way hashes. Sensitive actions are checked on our servers.' },
      { h: 'Your choices', p: 'You can edit your profile and addresses in the app at any time. To delete your account or data, contact us using the details on the Contact page.' },
      { h: 'Changes', p: 'We may update this policy. The latest version is always available in the app.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      { h: 'Using Freshora', p: 'By creating an account you confirm that the details you give are correct and that you will keep your password private.' },
      { h: 'Orders and prices', p: 'Prices, discounts and delivery fees are calculated on our servers at the time you place the order. Products are subject to availability.' },
      { h: 'Delivery', p: 'Delivery times shown in the app are estimates and can change because of traffic, weather or demand.' },
      { h: 'Cancellations', p: 'An order can be cancelled while it is still pending or confirmed. Once it is packed or shipped it can no longer be cancelled in the app.' },
      { h: 'Payments', p: 'Cash on delivery is available. Other payment options may be shown for demonstration until online payments are launched.' },
      { h: 'Changes', p: 'We may update these terms. Continued use of the app means you accept the updated terms.' },
    ],
  },
};
