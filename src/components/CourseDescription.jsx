import { useState } from "react";

const CourseDescription = () => {
  const [expanded, setExpanded] = useState(false);

  const text = `
AI automation and Agentic AI are redefining how modern businesses operate.
With the rapid rise of intelligent agents, autonomous workflows, and no-code
automation platforms, the ability to build AI-driven systems is becoming a core
skill for developers, analysts, and AI professionals.

n8n, a powerful open-source automation tool, is at the center of this
transformation. It allows you to connect APIs, LLMs, business applications, and
custom logic into smart automated workflows—without heavy coding.

This course, Complete AI Automation And Agentic AI Bootcamp With n8n, gives you
a comprehensive understanding of how to leverage n8n to create intelligent
automation systems and build fully functional Agentic AI applications.

From fundamentals to advanced automation, this course covers everything you
need to design, develop, and deploy cutting-edge AI workflows.

Introduction to AI Automation and n8n:
• Understand AI automation and intelligent agents
• Learn why n8n is popular for automation
• Explore APIs, LLMs, and real-world use cases

Core Concepts of n8n:
• Workflow architecture
• Nodes, triggers, integrations
• API authentication and enterprise patterns

Building AI Systems:
• Integrate ChatGPT, Claude, open-source models
• Build autonomous AI agents
• Retrieval-augmented workflows

Projects:
• AI automation bot
• Content-generation pipelines
• Multi-agent workflows
• Docker & CI/CD deployments

By the end of this course, you will master AI-driven automation using n8n.
`;

  return (
    <div>
      <p style={{ fontSize: "13px", lineHeight: "1.7" }}>
        {expanded ? text : `${text.substring(0, 500)}...`}
      </p>

      <button
        className="btn btn-link p-0"
        style={{ fontSize: "13px", textDecoration: "none" }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </div>
  );
};

export default CourseDescription;
