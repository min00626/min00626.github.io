---
date: 2024-12-28
date_end: 2024-12-30
title: Custom Development Tool
description: UI Toolkit과 GraphView를 사용하여 팀 프로젝트에서 사용할 맞춤형 개발용 툴을 제작한 프로젝트입니다.
tags:   [Unity]
image:  '/images/datagraph_thumbnail2.png'
---

## 프로젝트 개요

진행 중인 팀 프로젝트에서 게임에 사용될 퀘스트 정보를 JSON 형태로 관리하기로 하였는데, JSON의 구조가 복잡해 시나리오 팀이 직접 작성하기에 어려움이 있었습니다. 이 문제를 해결하기 위해 퀘스트 정보를 시각적으로 작성하고 편집할 수 있는 개발용 툴을 제작하여 시나리오 팀이 쉽게 퀘스트 정보를 기입할 수 있도록 하였습니다.

그래프 에디터는 그래프 형태의 데이터를 직관적으로 편집할 수 있는 개발용 툴입니다. 퀘스트 그래프를 편집하기 위한 목적으로 제작하였지만, 확장성을 고려하여 제작하였기 때문에 대화문 등 그래프의 형태로 나타낼 수 있는 데이터를 추가로 지원하도록 쉽게 확장할 수 있습니다. 

프로젝트의 전체 코드는 ![GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){: style="width: 20px; vertical-align: middle;"} [GitHub 리포지토리](https://github.com/min00626/DataGraphEditor)에서 확인하실 수 있습니다.

***

### 주요 기술

1. **GraphView** : 노드와 엣지를 생성하고 연결해 그래프를 표현하기 위해 사용하였습니다.

2. **UI Toolkit** : UI를 구현하고 툴을 보다 직관적으로 사용할 수 있게끔 디자인하기 위해 사용하였습니다.

3. **Reflection** : 커스텀 인스펙터에서 노드의 데이터에 접근 및 수정하기 위해 사용하였습니다.

***

## 시연 영상

<div style="text-align: center;">
    <a href="https://youtu.be/W1pTG3MmSE8">
        <img src="http://img.youtube.com/vi/W1pTG3MmSE8/sddefault.jpg" alt="Video Label" style="display: block; margin: 0 auto;">
    </a>
</div>
<div style="text-align: center; color: #888888; font-size: 14px; margin-top: 10px;">
  유튜브 영상 링크
</div>

***

## 세부 설명

그래프 에디터는 크게 두 가지 영역으로 나뉩니다. 첫 번째는 그래프를 편집할 수 있는 그래프 뷰이고, 두 번째는 노드 내부의 데이터를 확인하고 편집할 수 있는 인스펙터 뷰입니다.

<br>
#### 그래프 뷰

![DG](/images/graphview.png){: width="1200" height="900"}

그래프 뷰에서는 노드와 엣지를 생성해 그래프를 시각화할 수 있습니다. GraphView를 사용하여 구현하였습니다.

노드는 확장성을 고려해 디자인하여 쉽게 새로운 종류의 노드를 구현할 수 있습니다. 다양한 기능을 모듈화하여 해당 기능을 필요로 하는 노드를 추가로 구현할 경우에도 쉽게 적용할 수 있도록 하였습니다. 한 가지 예시는 서브그래프 기능입니다.

```cs
public interface ISubGraph
{
	public DataGraphAsset SubGraph { get; }
}

public class QuestNode : DataGraphNode, ISubGraph
{
    ...
}
```
<br>
위 예시에 나타난 ISubGraph 인터페이스의 경우, 서브그래프를 가지는 노드를 위한 인터페이스입니다. 서브그래프 기능을 가지는 노드를 생성할 경우 자동으로 추가적인 그래프 애셋을 생성하여 해당 노드의 서브그래프로 지정합니다. 서브그래프를 가지는 노드를 그래프 뷰에서 더블클릭할 경우 해당 노드의 서브그래프를 편집할 수 있습니다.

![DG](/images/subgraph.gif){: width="1200" height="900"}
<div style="text-align: center; color: #888888; font-size: 14px; margin-top: -20px; margin-bottom: 20px;">
  ISubGraph를 구현하는 QuestNode를 더블클릭하면 서브그래프를 편집할 수 있다.
</div>

이러한 기능을 가지는 새로운 노드를 구현하는 경우, ISubGraph 인터페이스를 구현하기만 하면 됩니다. 이처럼 기능을 모듈화하여 확장 및 유지보수를 용이하게 하였습니다.

<br>
#### 인스펙터 뷰

![DG](/images/inspectorview.png){: width="1200" height="900"}

인스펙터 뷰에서는 선택한 노드의 데이터를 확인하고, 편집할 수 있습니다. `Reflection`을 사용해 노드가 가진 데이터에 접근하여 수정할 수 있게 하였고, `UI Toolkit`을 사용해 직관적으로 디자인하였습니다.

인스펙터 뷰 또한 그래프 뷰와 마찬가지로 다양한 기능을 쉽게 사용할 수 있게 제공합니다. 한 가지 예시는 `Section Attribute`입니다. `Section Attribute`를 사용하면 인스펙터 뷰를 여러 섹션으로 나누어 더 직관적으로 인스펙터를 사용할 수 있습니다.

![DG](/images/section.png){: width="1200" height="900"}
<div style="text-align: center; color: #888888; font-size: 14px; margin-top: -20px; margin-bottom: 20px;">
  <좌> Section Attribute 사용</좌>&nbsp;&nbsp;&nbsp;&nbsp;<우> 인스펙터 뷰에서 Section 표현</우>
</div>

`Section Attribute` 외에도 ```HideInInspectorView``` 등의 유용한 Attribute를 제공하여 최적의 작업 환경을 조성할 수 있게 하였고, 툴에 익숙하지 않은 타 부서와 원활하게 협업할 수 있도록 하였습니다.

***

## 프로젝트 결과

![DG](/images/jsonconverter.gif){: width="1200" height="900"}
<div style="text-align: center; color: #888888; font-size: 14px; margin-top: -20px; margin-bottom: 20px;">
  <좌> 작성한 그래프</좌>&nbsp;&nbsp;&nbsp;&nbsp;<우> 변환된 JSON 파일</우>
</div>

작성한 그래프는 좌상단의 `Convert to JSON` 버튼을 통해 자동으로 JSON으로 변환됩니다. 위 예시에서 확인할 수 있듯이, 매우 길고 복잡한 JSON을 그래프의 형태로 직관적으로 표현하고 편집할 수 있습니다.

이렇게 제작한 개발용 툴 덕분에 팀 프로젝트의 능률이 비약적으로 상승하였고, 타 부서의 요구에 맞추어 프로젝트에서 필요로 하는 기능을 제공하는 맞춤형 개발용 툴을 제작하는 경험을 쌓을 수 있었습니다.