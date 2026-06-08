# -*- coding: utf-8 -*-
"""测试 Agent 对话功能的脚本"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8899"

def print_info(msg):
    """安全打印信息"""
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('utf-8', errors='replace').decode('gbk', errors='replace'))

def create_session():
    """创建新会话"""
    print_info("=== 创建会话 ===")
    try:
        response = requests.post(f"{BASE_URL}/sessions", json={"title": "测试会话"})
        response.raise_for_status()
        data = response.json()
        session_id = data.get("session_id")
        print_info("会话创建成功: " + session_id)
        return session_id
    except Exception as e:
        print_info("创建会话失败: " + str(e))
        return None

def send_message(session_id: str, message: str, language: str = "Chinese"):
    """发送消息"""
    print_info("\n=== 发送消息 (" + language + ") ===")
    print_info("消息: " + message)
    
    try:
        response = requests.post(
            f"{BASE_URL}/sessions/{session_id}/messages",
            json={"content": message, "language": language},
            stream=True
        )
        response.raise_for_status()
        
        print_info("响应:")
        full_response = ""
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                decoded = chunk.decode('utf-8')
                lines = decoded.split('\n')
                for line in lines:
                    if line.startswith('data: '):
                        try:
                            data = json.loads(line[5:])
                            if 'content' in data:
                                content = data['content']
                                full_response += content
                                print_info(content, end='')
                        except json.JSONDecodeError:
                            pass
        print_info("\n")
        return full_response
    except Exception as e:
        print_info("发送消息失败: " + str(e))
        return None

def test_multilingual():
    """测试多语言功能"""
    session_id = create_session()
    if not session_id:
        return
    
    print_info("\n" + "="*50)
    print_info("测试1: 中文提问，期望中文回复")
    print_info("="*50)
    send_message(session_id, "你好，我想了解一下股票分析功能", "Chinese")
    
    print_info("\n" + "="*50)
    print_info("测试2: 英文提问，期望英文回复")
    print_info("="*50)
    send_message(session_id, "Hello, can you help me with stock analysis?", "English")
    
    print_info("\n" + "="*50)
    print_info("测试3: 数学问题，测试工具调用")
    print_info("="*50)
    send_message(session_id, "计算 25 的平方根是多少", "Chinese")
    
    print_info("\n" + "="*50)
    print_info("测试完成!")
    print_info("="*50)

if __name__ == "__main__":
    print_info("Agent 对话功能测试脚本")
    print_info("="*50)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print_info("服务连接正常")
            test_multilingual()
        else:
            print_info("服务状态异常: " + str(response.status_code))
    except requests.exceptions.RequestException as e:
        print_info("无法连接到服务: " + str(e))
        print_info("请确保服务已启动在 http://127.0.0.1:8899")