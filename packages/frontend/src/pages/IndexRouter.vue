<template>
	<component :is="isMobile ? MobileHome : PcHome"></component>
</template>

<script setup>
import PcHome from './IndexPage.vue';
import MobileHome from './mobile/IndexPage.vue';
import { isMobile } from '../utils/resize';
</script>
