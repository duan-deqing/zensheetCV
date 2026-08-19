import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.ai_service import AIService


@pytest.mark.asyncio
async def test_polish_stream():
    service = AIService()
    mock_chunk = MagicMock()
    mock_chunk.choices = [MagicMock()]
    mock_chunk.choices[0].delta.content = "优化后的文本"

    mock_stream = AsyncMock()
    mock_stream.__aiter__.return_value = [mock_chunk]

    service.client = AsyncMock()
    service.client.chat.completions.create.return_value = mock_stream

    result = []
    async for delta in service.polish("原始文本", "工作经历"):
        result.append(delta)

    assert len(result) > 0
    assert "优化" in result[0]


@pytest.mark.asyncio
async def test_analyze_keywords():
    service = AIService()
    service.client = AsyncMock()
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"matched": ["React"], "missing": ["Vue"], "suggestions": ["建议1"]}'
    service.client.chat.completions.create.return_value = mock_response

    result = await service.analyze_keywords("需要React", "我有React经验")
    assert "matched" in result
    assert "missing" in result


@pytest.mark.asyncio
async def test_generate_stream():
    service = AIService()
    mock_chunk = MagicMock()
    mock_chunk.choices = [MagicMock()]
    mock_chunk.choices[0].delta.content = "STAR格式描述"

    mock_stream = AsyncMock()
    mock_stream.__aiter__.return_value = [mock_chunk]

    service.client = AsyncMock()
    service.client.chat.completions.create.return_value = mock_stream

    result = []
    async for delta in service.generate_content(["要点1", "要点2"], "项目经验"):
        result.append(delta)

    assert len(result) > 0


@pytest.mark.asyncio
async def test_no_api_key():
    service = AIService()
    service.client = None

    result = []
    async for delta in service.polish("文本", "工作经历"):
        result.append(delta)

    assert len(result) == 1
    assert "未配置" in result[0]
