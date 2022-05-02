<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton class="inline-flex justify-center w-full">
        Surveys
        <ChevronDownIcon
          v-if="showChevron"
          class="-mr-1 ml-3 h-5 w-5"
          aria-hidden="true"
        />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="py-1">
          <MenuItem v-for="entry in dropdownItems" :key="entry.key">
            <router-link
              :to="entry.to"
              active-class="bg-gray-100 text-gray-900"
              class="block px-4 py-2 text-sm text-gray-700"
            >
              {{ entry.label }}
            </router-link>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/solid";

export default defineComponent({
  name: "DropdownComponent",
  components: {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    ChevronDownIcon,
  },
  props: {
    dropdownItems: {
      type: Array,
      required: true,
      validator(value: unknown): boolean {
        return (
          Array.isArray(value) &&
          value.every(
            (entry) =>
              typeof entry.to !== "undefined" &&
              typeof entry.key !== "undefined" &&
              entry.label === "string"
          )
        );
      },
    },
    showChevron: {
      type: Boolean,
      default: () => true,
    },
  },
});
</script>
