---
date: 2024-08-28
date_end: 2024-08-30
title: Robot Factory
description: >-
  Object-Oriented 대신 Data-Oriented Design을 사용하여 고도로 최적화된 뱀파이어 서바이버즈 스타일 게임을 개발한 프로젝트입니다.
tags:
  - Unity
image: /images/dots_thumbnail.png
---




## 프로젝트 개요
몰려오는 수많은 적을 다양한 폭탄을 사용해 처치하는 뱀파이어 서바이버즈 스타일의 게임을 개발한 프로젝트입니다. 최적화에 특화된 디자인 패러다임인 Data-Oriented Design을 사용해 수많은 적이 등장하는 상황에서도 쾌적한 게임 환경을 유지할 수 있도록 하였습니다.

프로젝트의 전체 코드는 ![GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){: style="width: 20px; vertical-align: middle;"} [GitHub 리포지토리](https://github.com/min00626/DOTS/tree/master)에서 확인하실 수 있습니다.






***

## 프로젝트 핵심 기술
이 프로젝트에 사용된 주요 기술은 다음과 같습니다.

1. **Burst Compiler**: C# 코드를 네이티브 코드로 컴파일하여 실행 성능을 극대화합니다. Burst Compiler는 특히 CPU 집약적인 작업에서 큰 성능 향상을 제공합니다.

2. **Job System**: 멀티스레딩을 활용하여 병렬 처리를 효율적으로 관리합니다. 이를 통해 여러 작업을 동시에 처리하며, 게임의 복잡한 연산 작업을 최적화합니다.

3. **Entity Component System (ECS)**: 전통적인 객체 지향 방식이 아닌, 데이터 중심의 설계를 가능하게 하여 캐싱 효율과 실행 성능을 향상시킵니다. ECS는 게임의 모든 요소를 독립된 데이터와 시스템으로 분리하여 관리합니다.

***

## 프로젝트 결과
구현된 게임의 영상입니다.

![지뢰](/images/mine.gif){: width="1200" height="900"}

![유탄](/images/grenade.gif){: width="1200" height="900"}

![다이너마이트](/images/dynamite.gif){: width="1200" height="900"}

***

## 결과 분석
DOD가 적절히 구현되었는지 확인하기 위해, 본 프로젝트의 OOP 버전을 따로 구현하여 성능을 비교하였습니다. 적 캐릭터의 수에 따른 평균 FPS와 최소 FPS의 차이는 다음과 같습니다.   

<div id="PerformanceComparisonFPS" style="width: 100%; height: 400px;"></div>   

<script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>  

<script type="text/javascript">
    var theme = 'light';
    var backgroundColor = '#f2f6ff';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
        backgroundColor = '#323232';
    }

    var chart = echarts.init(document.getElementById('PerformanceComparisonFPS'), theme);
    window.addEventListener('resize', function() {
        chart.resize();
    });

    // Convert ms per frame to FPS
    function msToFPS(ms) {
        return (1000 / ms).toFixed(2);
    }

    var option = {
        backgroundColor: backgroundColor,
        grid: {
            left: '60px',
            right: '10',
            top: '90px'
        },
        color: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'],
        title: {
            text: 'OOP vs DOD 성능 비교 (FPS)',
            x: 'center',
            textStyle: {
                fontSize: 18,
                fontStyle: 'normal'
            },
            padding: [20, 0, 40, 0]  // 제목 위에 20px 공백 추가
        },
        legend: {
            data: ['OOP 평균', 'OOP 최소', 'DOD 평균', 'DOD 최소'],
            top: 50
        },
        xAxis: {
            type: 'category',
            data: ['5000', '10000', '20000'],
            name: '적 캐릭터 수',
            nameLocation: 'middle',
            nameGap: 30
        },
        yAxis: {
            type: 'value',
            min: 0,
            name: 'FPS',
            nameLocation: 'middle',
            nameGap: 40
        },
        series: [
            {
                name: 'OOP 평균',
                type: 'bar',
                label: {
                    show: true,
                    position: 'top'
                },
                itemStyle: {
                    color: '#0000FF'  // 색상 설정
                },
                data: [msToFPS(23.62), msToFPS(74.52), msToFPS(537.84)]
            },
            {
                name: 'OOP 최소',
                type: 'bar',
                label: {
                    show: true,
                    position: 'top'
                },
                itemStyle: {
                    color: '#87CEEB'  // 색상 설정
                },
                data: [msToFPS(32.22), msToFPS(85.32), msToFPS(587.09)]
            },
            {
                name: 'DOD 평균',
                type: 'bar',
                label: {
                    show: true,
                    position: 'top'
                },
                itemStyle: {
                    color: '#FF0000'  // 색상 설정
                },
                data: [msToFPS(6.99), msToFPS(6.99), msToFPS(8.37)]
            },
            {
                name: 'DOD 최소',
                type: 'bar',
                label: {
                    show: true,
                    position: 'top'
                },
                itemStyle: {
                    color: '#FFA500'  // 색상 설정
                },
                data: [msToFPS(8.04), msToFPS(7.71), msToFPS(11.64)]
            }
        ]
    };
    chart.setOption(option);
</script>

<br/>
적 캐릭터의 수가 많아질수록 DOD의 성능이 OOP를 압도하여, 적 캐릭터의 수가 20000인 경우 DOD가 OOP에 비해 평균 FPS 기준 60배 이상, 최소 FPS 기준 50배 이상의 매우 높은 성능을 보여줍니다. 이로써 DOD가 적절하게 구현되었고, DOD가 OOP에 비해 성능 측면에서 큰 강점을 가진다는 것을 확인하였습니다.

***

## 코드 샘플

아래 코드는 본 프로젝트에서 적 캐릭터를 움직일 때 사용된 ECS 기반의 System 코드입니다. Burst Compiler와 Job System을 활용하여 최적화를 수행하였습니다.

```cs
using Unity.Burst;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;

public partial struct EnemyControlSystem : ISystem
{
	private EntityQuery playerEntityQuery;

	public void OnCreate(ref SystemState state)
	{
		playerEntityQuery = state.GetEntityQuery(ComponentType.ReadOnly<Player>(), 
                                                           ComponentType.ReadOnly<LocalTransform>());
		state.RequireForUpdate<Enemy>();
		state.RequireForUpdate(playerEntityQuery);
	}

	[BurstCompile]
	public void OnUpdate(ref SystemState state)
	{
		Entity playerEntity = playerEntityQuery.GetSingletonEntity();
		LocalTransform playerLocalTransform 
                                    = state.EntityManager.GetComponentData<LocalTransform>(playerEntity);
		// Job 생성 및 스케줄
		new EnemyControlJob { 
			deltaTime = SystemAPI.Time.DeltaTime,
			playerLocalTransform = playerLocalTransform,
		}.Schedule();
	}

	[BurstCompile]
	[WithAll(typeof(Enemy))]
	public partial struct EnemyControlJob : IJobEntity
	{
		public float deltaTime;
		public LocalTransform playerLocalTransform;

		public void Execute(ref LocalTransform localTransform)
		{
			float3 dir = playerLocalTransform.Position - localTransform.Position;
			dir.y = 0;
			dir = math.normalizesafe(dir);

			localTransform.Rotation = quaternion.LookRotationSafe(dir, math.up());
			float distance 
                                = math.length(playerLocalTransform.Position - localTransform.Position);
			if (distance > 3f)
			{
				localTransform = localTransform.Translate(dir * deltaTime * 4);
			}
		}
	}
}
```
