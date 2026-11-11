<script setup>
    import { ref, computed } from 'vue';
    import BookCard from "@/components/BookCard.vue";
    const books = [
        {
            MaSach: 'S001',
            TenSach: 'Mắt biếc',
            'NguonGoc/TacGia': 'Nguyễn Nhật Ánh',
            SoQuyen: 5,
            conLai: 4
        },
        {
            MaSach: 'S003',
            TenSach: 'Cánh đồng bất tận',
            'NguonGoc/TacGia': 'Nguyễn Ngọc Tư',
            SoQuyen: 3,
            conLai: 0
        },
        {
            MaSach: 'S004',
            TenSach: 'Truyện gay',
            'NguonGoc/TacGia': 'Phan Lê Hoàng Quí',
            SoQuyen: 69,
            conLai: 1
        },
        {
            MaSach: 'S005',
            TenSach: 'Nhà thôi miên I',
            'NguonGoc/TacGia': 'Cao Minh',
            SoQuyen: 3,
            conLai: 0
        },
        {
            MaSach: 'S006',
            TenSach: 'Nhà thôi miên II',
            'NguonGoc/TacGia': 'Cao Minh',
            SoQuyen: 3,
            conLai: 0
        },
    ];

    const isChecked = ref(false);
    
    const visibleBooks = computed(() => {
        if(isChecked.value === false) {
            return books;
        }

        return books.filter((book) => book.conLai > 0);
    });

</script>

<template>
    <div>
        <input type="checkbox" id="availableBooks" v-model="isChecked"  />
        <label for="availableBooks">Chỉ sách còn</label>
    </div>
    <div class="book-cards-section">
        <BookCard v-for="book in visibleBooks" :key="book.MaSach" :book="book" />
    </div>
</template>