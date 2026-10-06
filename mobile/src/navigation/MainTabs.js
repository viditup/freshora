import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import Home from '../screens/Home';
import Categories from '../screens/Categories';
import Orders from '../screens/Orders';
import Offers from '../screens/Offers';
import Profile from '../screens/Profile';
import Search from '../screens/Search';
import Cart from '../screens/Cart';
import Notifications from '../screens/Notifications';
import Products from '../screens/Products';
import ProductDetails from '../screens/ProductDetails';
import Wishlist from '../screens/Wishlist';
import ShareProduct from '../screens/ShareProduct';
import Checkout from '../screens/Checkout';
import Article from '../screens/Article';
import Addresses from '../screens/Addresses';
import AddressForm from '../screens/AddressForm';
import OrderSuccess from '../screens/OrderSuccess';
import OrderDetails from '../screens/OrderDetails';
import EditProfile from '../screens/EditProfile';
import ChangePassword from '../screens/ChangePassword';
import PaymentMethods from '../screens/PaymentMethods';
import AllCategories from '../screens/AllCategories';
import Wallet from '../screens/Wallet';
import ReferEarn from '../screens/ReferEarn';
import Help from '../screens/Help';
import Settings from '../screens/Settings';
import { C, TAB_H, FONT } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const header = { headerTintColor: C.green, headerStyle: { backgroundColor: C.bg }, headerShadowVisible: false, headerTitleAlign: 'left', headerTitleStyle: { color: C.dark2, fontFamily: FONT.headingBold, fontSize: 18 } }; // PART 10: same bold title style on every native header

// Screens reachable from ANY tab (header search / bell / cart / address, product flow, cart -> checkout -> order).
// Registering them in every tab stack keeps the bottom tab bar visible and makes plain navigate('Cart') etc. work everywhere.
import InfoPage from '../screens/InfoPage';
const INFO_TITLES = { about: 'About Us', contact: 'Contact', privacy: 'Privacy Policy', terms: 'Terms' };
const SHARED = [
  ['Search', Search, { headerShown: false }],
  ['Cart', Cart, { title: '' }],
  ['Notifications', Notifications, { title: 'Notifications' }],
  ['AllCategories', AllCategories, { title: '' }],
  ['Products', Products, ({ route }) => ({ title: route.params?.categoryId ? '' : (route.params?.title || 'Products') })],
  ['ProductDetails', ProductDetails, { title: '' }],
  ['Wishlist', Wishlist, { title: 'My Wishlist' }],
  ['ShareProduct', ShareProduct, { title: 'Share product' }],
  ['Checkout', Checkout, { title: '' }],
  ['Addresses', Addresses, ({ route }) => ({ title: route.params?.select ? 'Select Address' : 'My Addresses' })],
  ['AddressForm', AddressForm, ({ route }) => ({ title: route.params?.address ? 'Edit Address' : 'Add Address' })],
  ['Article', Article, { title: 'Read & Learn' }],
  ['InfoPage', InfoPage, ({ route }) => ({ title: INFO_TITLES[route.params?.page] || 'Info' })],
  ['OrderSuccess', OrderSuccess, { headerShown: false, gestureEnabled: false }],
  ['OrderDetails', OrderDetails, { title: 'Order Details' }],
];
const PROFILE_ONLY = [
  ['EditProfile', EditProfile, { title: 'Edit Profile' }],
  ['ChangePassword', ChangePassword, { title: 'Change Password' }],
  // PART 9 (profile menu screens)
  ['PaymentMethods', PaymentMethods, { title: 'Payment Methods' }],
  ['Wallet', Wallet, { title: 'Wallet' }],
  ['ReferEarn', ReferEarn, { title: 'Refer & Earn' }],
  ['Help', Help, { title: 'Help & Support' }],
  ['Settings', Settings, { title: 'Settings' }],
];

const makeStack = (Root, extra = []) => () => (
  <Stack.Navigator screenOptions={header}>
    <Stack.Screen name="Root" component={Root} options={{ headerShown: false }} />
    {[...SHARED, ...extra].map(([name, comp, options]) => <Stack.Screen key={name} name={name} component={comp} options={options} />)}
  </Stack.Navigator>
);
const HomeStack = makeStack(Home);
const CategoryStack = makeStack(Categories);
const OrdersStack = makeStack(Orders);
const OffersStack = makeStack(Offers);
const ProfileStack = makeStack(Profile, PROFILE_ONLY);

// PART 10: Offers tab carries a small red dot (design). Outline icon when idle, filled when active.
const TabIcon = ({ name, focused, color, size, dot }) => (
  <View>
    <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />
    {dot && <View style={{ position: 'absolute', top: -1, right: -3, width: 8, height: 8, borderRadius: 4, backgroundColor: C.red, borderWidth: 1, borderColor: '#fff' }} />}
  </View>
);
const ICONS = { HomeTab: 'home', CategoriesTab: 'grid', OrdersTab: 'receipt', OffersTab: 'pricetag', ProfileTab: 'person' };

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: C.green, tabBarInactiveTintColor: C.muted,
      tabBarLabelStyle: { fontSize: 11, fontFamily: FONT.bodySemi }, tabBarActiveBackgroundColor: 'transparent',
      // Height + padding include the bottom inset so the bar never sits under gesture/nav bars.
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.border, height: TAB_H + insets.bottom, paddingBottom: Math.max(insets.bottom, 8), paddingTop: 6 },
      tabBarIcon: ({ focused, color, size }) => <TabIcon name={ICONS[route.name]} focused={focused} color={color} size={size} dot={route.name === 'OffersTab'} />,
    })}>
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="CategoriesTab" component={CategoryStack} options={{ title: 'Categories' }} />
      <Tab.Screen name="OrdersTab" component={OrdersStack} options={{ title: 'Orders' }} />
      <Tab.Screen name="OffersTab" component={OffersStack} options={{ title: 'Offers' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// CartProvider mounts only after login, so the cart loads on entry and resets on logout.
// WishlistProvider wraps everything so the header badge and every heart stay in sync.
export default function MainTabs() {
  return <WishlistProvider><CartProvider><Tabs /></CartProvider></WishlistProvider>;
}
