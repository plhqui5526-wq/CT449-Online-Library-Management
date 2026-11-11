<script setup>
    defineProps({
        book: Object,
    });
</script>

<template>
    <div class="book-card">
        <h3>{{ book.TenSach }}</h3>
        <p>{{ book['NguonGoc/TacGia'] }}</p>
        <p :class="{available: book.conLai > 0, unavailable: book.conLai === 0}">{{ book.conLai > 0 ? "Còn " + book.conLai + " quyền" : "Hết sách" }}</p>
    </div>
</template>
