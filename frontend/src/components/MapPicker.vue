<template>
  <div class="map-picker">
    <div class="map-container" ref="mapContainer"></div>
    <div class="location-info" v-if="selectedLocation">
      <p>已选择位置：{{ selectedLocation.address }}</p>
      <p>坐标：{{ selectedLocation.latitude }}, {{ selectedLocation.longitude }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Location {
  latitude: number
  longitude: number
  address: string
}

const props = defineProps<{
  initialLocation?: Location
}>()

const emit = defineEmits<{
  (e: 'update:location', location: Location): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const selectedLocation = ref<Location | null>(props.initialLocation || null)
let map: any = null
let marker: any = null

onMounted(async () => {
  // 这里需要替换为实际的地图API实现
  // 示例使用高德地图
  if (window.AMap) {
    initMap()
  } else {
    // 动态加载地图脚本
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_KEY`
    script.async = true
    script.onload = initMap
    document.head.appendChild(script)
  }
})

const initMap = () => {
  if (!mapContainer.value) return

  map = new window.AMap.Map(mapContainer.value, {
    zoom: 13,
    center: selectedLocation.value 
      ? [selectedLocation.value.longitude, selectedLocation.value.latitude]
      : [116.397428, 39.90923] // 默认北京
  })

  // 添加点击事件
  map.on('click', (e: any) => {
    const { lng, lat } = e.lnglat
    updateMarker(lng, lat)
    getAddress(lng, lat)
  })

  // 如果有初始位置，添加标记
  if (selectedLocation.value) {
    updateMarker(
      selectedLocation.value.longitude,
      selectedLocation.value.latitude
    )
  }
}

const updateMarker = (lng: number, lat: number) => {
  if (marker) {
    marker.setPosition([lng, lat])
  } else {
    marker = new window.AMap.Marker({
      position: [lng, lat],
      map: map
    })
  }
}

const getAddress = (lng: number, lat: number) => {
  const geocoder = new window.AMap.Geocoder()
  geocoder.getAddress([lng, lat], (status: string, result: any) => {
    if (status === 'complete' && result.info === 'OK') {
      const address = result.regeocode.formattedAddress
      selectedLocation.value = {
        latitude: lat,
        longitude: lng,
        address
      }
      emit('update:location', selectedLocation.value)
    }
  })
}

watch(() => props.initialLocation, (newLocation) => {
  if (newLocation && map) {
    map.setCenter([newLocation.longitude, newLocation.latitude])
    updateMarker(newLocation.longitude, newLocation.latitude)
  }
})
</script>

<style scoped>
.map-picker {
  width: 100%;
  height: 300px;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.location-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-info p {
  margin: 5px 0;
  font-size: 14px;
}
</style> 