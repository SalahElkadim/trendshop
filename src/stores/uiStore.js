import { makeAutoObservable } from "mobx";

class UiStore {
  // Drawer / Modal
  cartOpen = false;
  searchOpen = false;
  mobileMenuOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggleCart() {
    this.cartOpen = !this.cartOpen;
  }
  toggleSearch() {
    this.searchOpen = !this.searchOpen;
  }
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeAll() {
    this.cartOpen = false;
    this.searchOpen = false;
    this.mobileMenuOpen = false;
  }
}

export default new UiStore();
