---
date: 2018-11-12 12:01:35
title: Gaussian Filtering With GPU
description: >-
  CUDA를 통해 GPU를 사용하는 가우시안 필터링을 구현하고, 최적화 기법을 적용해 성능을 높인 프로젝트입니다.
tags:
  - CUDA
image: /images/GF_thumbnail.jpg
---

## 프로젝트 개요

CUDA를 통해 사용할 수 있는 GPU의 강력한 병렬 처리 능력을 이용해 매우 빠른 가우시안 필터링을 구현한 프로젝트입니다. Shared Memory, MWPT(More Work Per Thread)와 같은 최적화 기법을 적용해 필터링 속도를 높이는 것에 집중하였습니다.

***

## 프로젝트 수행 환경

프로젝트를 수행한 컴퓨터의 스펙 및 CUDA 버전은 다음과 같습니다.

1. **CPU** : Intel i7-12700F
2. **GPU** : GeForce RTX 3070 Ti
3. **CUDA** : 12.3

***

## 커널 코드
본 프로젝트에서는 총 세 가지 커널을 사용하였습니다.
1. **GF_Default**    : 아무런 최적화 기법을 적용하지 않은 커널
2. **GF_SM** : Shared Memory를 사용한 커널
3. **GF_SM_MWPT**    : Shared Memory를 사용하고, MWPT를 적용한 커널

<br>

##### GF_Default
한 스레드가 한 픽셀을 계산합니다. Global Memory에 저장된 픽셀 정보를 필요로 할 때마다 fetch합니다.

<details>
<summary>GF_Default 접기/펼치기</summary>
<div markdown="1">

```cpp
__global__ void GF_Default(const uchar4* __restrict input_image, uchar4* __restrict output_image, int nx, int ny) {
	auto idx = [&nx](int y, int x) { return y * nx + x; };

	int x = blockIdx.x * blockDim.x + threadIdx.x;
	int y = blockIdx.y * blockDim.y + threadIdx.y;
	if (x < 0 || y < 0 || x >= nx || y >= ny) return;

	int y_offset[5], x_offset[5];
	y_offset[0] = max(0, y - 2), y_offset[1] = max(0, y - 1), y_offset[2] = y, y_offset[3] = min(ny - 1, y + 1), y_offset[4] = min(ny - 1, y + 2);
	x_offset[0] = max(0, x - 2), x_offset[1] = max(0, x - 1), x_offset[2] = x, x_offset[3] = min(nx - 1, x + 1), x_offset[4] = min(nx - 1, x + 2);

	float4 v = make_float4(0.0f, 0.0f, 0.0f, 0.0f);
	int c_index = 0;
	for (int i_y = 0; i_y < 5; i_y++)
		for (int i_x = 0; i_x < 5; i_x++) {
			uchar4 pixel_in = *(input_image + idx(y_offset[i_y], x_offset[i_x]));
			float weight = filter_weight[c_index++];
			v.x += weight * pixel_in.x;
			v.y += weight * pixel_in.y;
			v.z += weight * pixel_in.z;
			v.w += weight * pixel_in.w;
		}
	*(output_image + idx(y, x)) = { (unsigned char)min(255, max(0, (unsigned int)(v.x + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v.y + 0.5f))), 
					(unsigned char)min(255, max(0, (unsigned int)(v.z + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v.w + 0.5f))) };
}
```
</div>
</details>

<br>

##### GF_SM
한 스레드가 한 픽셀을 계산합니다. 계산을 시작하기 전에 Global Memory의 픽셀 정보 중 계산에 사용할 부분을 Shared Memory에 저장합니다. 이후 픽셀 정보가 필요할 경우 Shared Memory에서 픽셀 정보를 fetch합니다.

<details>
<summary>GF_SM 접기/펼치기</summary>
<div markdown="1">

```cpp
template<int TS> __global__ void GF_SM(const uchar4* __restrict input_image, uchar4* __restrict output_image, int nx, int ny) {
	__shared__ uchar4 block[TS][TS];
	auto idx = [&nx](int y, int x) { return y * nx + x; };

	int x = blockIdx.x * blockDim.x + threadIdx.x;
	int y = blockIdx.y * blockDim.y + threadIdx.y;
	if (x < 0 || y < 0 || x >= nx || y >= ny) return;

	int y_offset[5], x_offset[5];
	y_offset[0] = max(0, y - 2), y_offset[1] = max(0, y - 1), y_offset[2] = y, y_offset[3] = min(ny - 1, y + 1), y_offset[4] = min(ny - 1, y + 2);
	x_offset[0] = max(0, x - 2), x_offset[1] = max(0, x - 1), x_offset[2] = x, x_offset[3] = min(nx - 1, x + 1), x_offset[4] = min(nx - 1, x + 2);


	int idx_x = threadIdx.x, idx_y = threadIdx.y;
	int side_left = 0, side_right = 0;
	block[idx_y + FILTERSIZEHALF][idx_x + FILTERSIZEHALF] = input_image[idx(y, x)];
	if (idx_x < FILTERSIZEHALF) {
		block[idx_y + FILTERSIZEHALF][idx_x] = input_image[idx(y, x_offset[0])];
		side_left = 1;
	}
	else if (idx_x >= blockDim.x - FILTERSIZEHALF) {
		block[idx_y + FILTERSIZEHALF][idx_x + 2 * FILTERSIZEHALF] = input_image[idx(y, x_offset[4])];
		side_right = 1;
	}

	if (idx_y < FILTERSIZEHALF) {
		block[idx_y][idx_x + FILTERSIZEHALF] = input_image[idx(y_offset[0], x)];
		if (side_left == 1) {
			block[idx_y][idx_x] = input_image[idx(y_offset[0], x_offset[0])];
		}
		if (side_right == 1) {
			block[idx_y][idx_x + 2 * FILTERSIZEHALF] = input_image[idx(y_offset[0], x_offset[4])];
		}
	}
	else if (idx_y >= blockDim.y - FILTERSIZEHALF) {
		block[idx_y + 2 * FILTERSIZEHALF][idx_x + FILTERSIZEHALF] = input_image[idx(y_offset[4], x)];
		if (side_left == 1) {
			block[idx_y + 2 * FILTERSIZEHALF][idx_x] = input_image[idx(y_offset[4], x_offset[0])];
		}
		if (side_right == 1) {
			block[idx_y + 2 * FILTERSIZEHALF][idx_x + 2 * FILTERSIZEHALF] = input_image[idx(y_offset[4], x_offset[4])];
		}
	}
	__syncthreads();

	float4 v = make_float4(0.0f, 0.0f, 0.0f, 0.0f);
	int c_index = 0;
	for (int i_y = idx_y; i_y < idx_y + FILTERSIZE; i_y++)
		for (int i_x = idx_x; i_x < idx_x + FILTERSIZE; i_x++) {
			uchar4 pixel_in = block[i_y][i_x];
			float weight = filter_weight[c_index++];
			v.x += weight * pixel_in.x;
			v.y += weight * pixel_in.y;
			v.z += weight * pixel_in.z;
			v.w += weight * pixel_in.w;
		}
	*(output_image + idx(y, x)) = { (unsigned char)min(255, max(0, (unsigned int)(v.x + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v.y + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v.z + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v.w + 0.5f))) };
}
```
</div>
</details>

<br>

##### GF_SM_MWPT
한 스레드가 n*n 영역의 픽셀을 계산합니다. GF_SM과 마찬가지로 Shared Memory에 필요한 영역을 저장한 뒤 계산을 시작합니다.


*작성된 커널 코드는 가독성보다 성능을 우선시하여 다소 복잡합니다.*

<details>
<summary>GF_SM_MWPT 접기/펼치기</summary>
<div markdown="1">

```cpp
template<int TS> __global__ void GF_SM_MWPT(const uchar4* __restrict input_image, uchar4* __restrict output_image, int nx, int ny) {
	__shared__ uchar4 block[TS][TS];
	auto idx = [&nx](int y, int x) { return y * nx + x; };

	int ocx = 2 * blockIdx.x * blockDim.x;
	int ocy = 2 * blockIdx.y * blockDim.y;
	int x = ocx + 2 * threadIdx.x;
	int y = ocy + 2 * threadIdx.y;
	if (x < 0 || y < 0 || x >= nx || y >= ny) return;

	int y_offset[6], x_offset[6];
	y_offset[0] = max(0, y - 2), y_offset[1] = max(0, y - 1), y_offset[2] = y, y_offset[3] = min(ny - 1, y + 1), y_offset[4] = min(ny - 1, y + 2), y_offset[5] = min(ny - 1, y + 3);
	x_offset[0] = max(0, x - 2), x_offset[1] = max(0, x - 1), x_offset[2] = x, x_offset[3] = min(nx - 1, x + 1), x_offset[4] = min(nx - 1, x + 2), x_offset[5] = min(nx - 1, x + 3);

	int idx_x = threadIdx.x, idx_y = threadIdx.y;
	int side_left = 0, side_right = 0;
	block[idx_y * 2 + FILTERSIZEHALF][idx_x * 2 + FILTERSIZEHALF] = input_image[idx(y, x)];
	block[idx_y * 2 + FILTERSIZEHALF + 1][idx_x * 2 + FILTERSIZEHALF] = input_image[idx(y_offset[3], x)];
	block[idx_y * 2 + FILTERSIZEHALF][idx_x * 2 + FILTERSIZEHALF + 1] = input_image[idx(y, x_offset[3])];
	block[idx_y * 2 + FILTERSIZEHALF + 1][idx_x * 2 + FILTERSIZEHALF + 1] = input_image[idx(y_offset[3], x_offset[3])];
	
	if (idx_y == 0) {
		block[0][idx_x * 2] = input_image[idx(y_offset[0], x_offset[0])];
		block[0][idx_x * 2 + FILTERSIZEHALF * 2] = input_image[idx(y_offset[0], x_offset[4])];
	}
	else if (idx_y == 1) {
		block[1][idx_x * 2] = input_image[idx(max(y_offset[0] - 1,0), x_offset[0])];
		block[1][idx_x * 2 + FILTERSIZEHALF * 2] = input_image[idx(max(y_offset[0] - 1, 0), x_offset[4])];
	}
	else if (idx_y == 2) {
		block[0][idx_x * 2 + 1] = input_image[idx(max(y_offset[0] - 4,0), x_offset[1])];
		block[0][idx_x * 2 + FILTERSIZEHALF * 2 + 1] = input_image[idx(max(y_offset[0] - 4,0), x_offset[5])];
	}
	else if (idx_y == 3) {
		block[1][idx_x * 2 + 1] = input_image[idx(max(y_offset[0] - 5,0), x_offset[1])];
		block[1][idx_x * 2 + FILTERSIZEHALF * 2 + 1] = input_image[idx(max(y_offset[0] - 5,0), x_offset[5])];
	}
	else if (idx_y == 4) {
		block[TS - 2][idx_x * 2] = input_image[idx(min(y_offset[5] + 5,ny-1), x_offset[0])];
		block[TS - 2][idx_x * 2 + FILTERSIZEHALF * 2] = input_image[idx(min(y_offset[5] + 5,ny-1), x_offset[4])];
	}
	else if (idx_y == 5) {
		block[TS - 1][idx_x * 2] = input_image[idx(min(y_offset[5] + 4, ny-1), x_offset[0])];
		block[TS - 1][idx_x * 2 + FILTERSIZEHALF * 2] = input_image[idx(min(y_offset[5] + 4, ny-1), x_offset[4])];
	}
	else if (idx_y == 6) {
		block[TS - 2][idx_x * 2 + 1] = input_image[idx(min(y_offset[5] + 1, ny-1), x_offset[1])];
		block[TS - 2][idx_x * 2 + FILTERSIZEHALF * 2 + 1] = input_image[idx(min(y_offset[5] + 1,ny-1), x_offset[5])];
	}
	else if (idx_y == 7) {
		block[TS - 1][idx_x * 2 + 1] = input_image[idx(y_offset[5], x_offset[1])];
		block[TS - 1][idx_x * 2 + FILTERSIZEHALF * 2 + 1] = input_image[idx(y_offset[5], x_offset[5])];
	}
	
	if (idx_x == 0) {
		block[idx_y * 2 + FILTERSIZEHALF][0] = input_image[idx(y, x_offset[0])];
	}
	else if (idx_x == 1) {
		block[idx_y * 2 + FILTERSIZEHALF][1] = input_image[idx(y, max(x_offset[0] - 1,0))];
	}
	else if (idx_x == 2) {
		block[idx_y * 2 + FILTERSIZEHALF + 1][0] = input_image[idx(y_offset[3], max(x_offset[0] - 4,0))];
	}
	else if (idx_x == 3) {
		block[idx_y * 2 + FILTERSIZEHALF + 1][1] = input_image[idx(y_offset[3], max(x_offset[0] - 5,0))];
	}
	else if (idx_x == 4) {
		block[idx_y * 2 + FILTERSIZEHALF][TS - 2] = input_image[idx(y, min(x_offset[5] + 5, nx-1))];
	}
	else if (idx_x == 5) {
		block[idx_y * 2 + FILTERSIZEHALF][TS - 1] = input_image[idx(y, min(x_offset[5] + 4, nx-1))];
	}
	else if (idx_x == 6) {
		block[idx_y * 2 + FILTERSIZEHALF + 1][TS - 2] = input_image[idx(y_offset[3], min(x_offset[5] + 1, nx-1))];
	}
	else if (idx_x == 7) {
		block[idx_y * 2 + FILTERSIZEHALF + 1][TS - 1] = input_image[idx(y_offset[3], x_offset[5])];
	}
	
	__syncthreads();

	float4 v1 = make_float4(0.0f, 0.0f, 0.0f, 255.0f);
	float4 v2 = make_float4(0.0f, 0.0f, 0.0f, 255.0f);
	float4 v3 = make_float4(0.0f, 0.0f, 0.0f, 255.0f);
	float4 v4 = make_float4(0.0f, 0.0f, 0.0f, 255.0f);
	
	// inner 4 * 4
	for (int i_y = 1; i_y < FILTERSIZE; i_y++) {
		for (int i_x = 1; i_x < FILTERSIZE; i_x++) {
			uchar4 pixel_in = block[idx_y * 2 + i_y][idx_x * 2 + i_x];
			float weight1 = filter_weight[i_y * FILTERSIZE + i_x];
			v1.x += weight1 * pixel_in.x;
			v1.y += weight1 * pixel_in.y;
			v1.z += weight1 * pixel_in.z;
			v1.w += weight1 * pixel_in.w;

			float weight2 = filter_weight[i_y * FILTERSIZE + (i_x - 1)];
			v2.x += weight2 * pixel_in.x;
			v2.y += weight2 * pixel_in.y;
			v2.z += weight2 * pixel_in.z;
			v2.w += weight2 * pixel_in.w;

			float weight3 = filter_weight[(i_y - 1) * FILTERSIZE + i_x];
			v3.x += weight3 * pixel_in.x;
			v3.y += weight3 * pixel_in.y;
			v3.z += weight3 * pixel_in.z;
			v3.w += weight3 * pixel_in.w;

			float weight4 = filter_weight[(i_y - 1) * FILTERSIZE + (i_x - 1)];
			v4.x += weight4 * pixel_in.x;
			v4.y += weight4 * pixel_in.y;
			v4.z += weight4 * pixel_in.z;
			v4.w += weight4 * pixel_in.w;
		}
	}
	
	for(int i_x = 1; i_x<FILTERSIZE;i_x++){
		uchar4 pixel_in = block[idx_y * 2][idx_x * 2 + i_x];
		float weight1 = filter_weight[i_x];
		float weight2 = filter_weight[i_x - 1];
			v1.x += weight1 * pixel_in.x;
			v1.y += weight1 * pixel_in.y;
			v1.z += weight1 * pixel_in.z;
			v1.w += weight1 * pixel_in.w;

			v2.x += weight2 * pixel_in.x;
			v2.y += weight2 * pixel_in.y;
			v2.z += weight2 * pixel_in.z;
			v2.w += weight2 * pixel_in.w;

			pixel_in = block[idx_y * 2 + FILTERSIZE][idx_x * 2 + i_x];

			v3.x += weight1 * pixel_in.x;
			v3.y += weight1 * pixel_in.y;
			v3.z += weight1 * pixel_in.z;
			v3.w += weight1 * pixel_in.w;

			v4.x += weight2 * pixel_in.x;
			v4.y += weight2 * pixel_in.y;
			v4.z += weight2 * pixel_in.z;
			v4.w += weight2 * pixel_in.w;
	}

	for (int i_y = 1; i_y < FILTERSIZE; i_y++) {
		uchar4 pixel_in = block[idx_y * 2 + i_y][idx_x * 2];
		float weight1 = filter_weight[i_y];
		float weight2 = filter_weight[i_y - 1];
		v1.x += weight1 * pixel_in.x;
		v1.y += weight1 * pixel_in.y;
		v1.z += weight1 * pixel_in.z;
		v1.w += weight1 * pixel_in.w;

		v3.x += weight2 * pixel_in.x;
		v3.y += weight2 * pixel_in.y;
		v3.z += weight2 * pixel_in.z;
		v3.w += weight2 * pixel_in.w;

		pixel_in = block[idx_y * 2 + i_y][idx_x * 2 + FILTERSIZE];

		v2.x += weight1 * pixel_in.x;
		v2.y += weight1 * pixel_in.y;
		v2.z += weight1 * pixel_in.z;
		v2.w += weight1 * pixel_in.w;

		v4.x += weight2 * pixel_in.x;
		v4.y += weight2 * pixel_in.y;
		v4.z += weight2 * pixel_in.z;
		v4.w += weight2 * pixel_in.w;
	}
	
	float weight = filter_weight[0];
	uchar4 pixel_in = block[idx_y * 2][idx_x * 2];
	v1.x += weight * pixel_in.x;
	v1.y += weight * pixel_in.y;
	v1.z += weight * pixel_in.z;
	v1.w += weight * pixel_in.w;

	pixel_in = block[idx_y * 2][idx_x * 2 + FILTERSIZE];
	v2.x += weight * pixel_in.x;
	v2.y += weight * pixel_in.y;
	v2.z += weight * pixel_in.z;
	v2.w += weight * pixel_in.w;

	pixel_in = block[idx_y * 2 + FILTERSIZE][idx_x * 2];
	v3.x += weight * pixel_in.x;
	v3.y += weight * pixel_in.y;
	v3.z += weight * pixel_in.z;
	v3.w += weight * pixel_in.w;

	pixel_in = block[idx_y * 2 + FILTERSIZE][idx_x * 2 + FILTERSIZE];
	v4.x += weight * pixel_in.x;
	v4.y += weight * pixel_in.y;
	v4.z += weight * pixel_in.z;
	v4.w += weight * pixel_in.w;
	
	*(output_image + idx(y, x)) = { 
					(unsigned char)min(255, max(0, (unsigned int)(v1.x + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v1.y + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v1.z + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v1.w + 0.5f))) };

	*(output_image + idx(y, x_offset[3])) = {
					(unsigned char)min(255, max(0, (unsigned int)(v2.x + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v2.y + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v2.z + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v2.w + 0.5f))) };

	*(output_image + idx(y_offset[3], x)) = {
					(unsigned char)min(255, max(0, (unsigned int)(v3.x + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v3.y + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v3.z + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v3.w + 0.5f))) };

	*(output_image + idx(y_offset[3], x_offset[3])) = {
	 				(unsigned char)min(255, max(0, (unsigned int)(v4.x + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v4.y + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v4.z + 0.5f))),
					(unsigned char)min(255, max(0, (unsigned int)(v4.w + 0.5f))) };
}
```
</div>
</details>

***

## 프로젝트 결과

이미지에 가우시안 필터를 적용한 예시입니다. 각 커널은 성능의 차이만 있을 뿐 결과물은 동일합니다. 해당 필터는 한 번 적용하는 것으로는 큰 차이가 드러나지 않아, 다음 예시는 필터를 10번 적용한 예시입니다.

*[필터 적용 전]*

![GF](/images/gf.jpg){: width="1200" height="900"}

*[필터 적용 후]*

![GF](/images/gf_filter.png){: width="1200" height="900"}


***

## 결과 분석

다음 차트는 이미지의 크기에 따른 각 커널의 수행 시간을 비교한 차트입니다. 사용한 가우시안 필터의 크기는 5*5이고, GF_SM_MWPT는 한 스레드 당 2\*2 영역의 픽셀을 계산하도록 하였습니다. CPU를 사용한 경우는 포함하지 않았는데, 소요 시간이 500배 이상으로 매우 커 차트의 가시성이 떨어지기 때문입니다.

<div id="GaussianFilteringComparison" style="width: 100%; height: 400px;"></div>

GF_SM의 경우, GF_Default보다 빠르기는 하나 큰 차이는 없는 모습을 보입니다. Shared Memory를 사용하는 방식은 같은 데이터를 여러 번 사용하는 경우에 큰 성능 향상을 보이는데, 가우시안 필터링은 비교적 같은 데이터를 적게 사용하기 때문입니다. 같은 데이터를 여러 번 다시 사용하는 Matrix Multiplication과 같은 연산에서는 Shared Memory만으로도 매우 큰 성능 향상을 확인할 수 있었습니다.

반면 GF_SM_MWPT 커널은 나머지 두 커널에 비해 많게는 2.5배 가량의 큰 성능 향상을 보였습니다. n*n 영역의 픽셀의 값을 동시에 계산하는 MWPT의 특성상 Shared Memory 접근 횟수를 크게 줄일 수 있기 때문입니다.


<script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>

<script type="text/javascript">
    var theme = 'light';
    var backgroundColor = '#f2f6ff';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
        backgroundColor = '#323232';
    }

    var chart = echarts.init(document.getElementById('GaussianFilteringComparison'), theme);
    window.addEventListener('resize', function() {
        chart.resize();
    });

    var option = {
        backgroundColor: backgroundColor,
        grid: {
            left: '60px',
            right: '10',
            top: '90px'
        },
        color: ['#1f77b4', '#ff7f0e', '#2ca02c'],
        title: {
            text: 'Gaussian Filtering 시간 비교 (ms)',
            x: 'center',
            textStyle: {
                fontSize: 18,
                fontStyle: 'normal'
            },
            padding: [20, 0, 40, 0]  // 제목 위에 20px 공백 추가
        },
        legend: {
            data: ['GF_Default', 'GF_SM', 'GF_SM_MWPT'],
            top: 50
        },
        xAxis: {
            type: 'category',
            data: ['512x512', '1856x1376', '2048x2048', '6304x4192', '7360x4832', '9984x6400'],
            name: '이미지 크기',
            nameLocation: 'middle',
            nameGap: 30
        },
        yAxis: {
            type: 'value',
            min: 0,
            name: '시간 (ms)',
            nameLocation: 'middle',
            nameGap: 40
        },
        series: [
            {
                name: 'GF_Default',
                type: 'bar',
                label: {
                    show: true,
                    position: 'top'
                },
                data: [.026, .23, .44, 2.35, 3.23, 5.79]
            },
            {
                name: 'GF_SM',
                type: 'bar',
                label: {
                    show: true,
                    position: 'top'
                },
                data: [.026, .21, .38, 2.36, 3.18, 5.57]
            },
            {
                name: 'GF_SM_MWPT',
                type: 'bar',
                label: {
                    show: true,
                    position: 'top'
                },
                data: [.015, .15, .14, .86, 1.28, 2.05]
            }
        ]
    };
    chart.setOption(option);
</script>
