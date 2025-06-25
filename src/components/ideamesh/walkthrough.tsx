
'use client';

import { useEffect } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useSidebar } from '@/components/ui/sidebar';

interface GraphWalkthroughProps {
  onComplete: () => void;
  onSelectNode: (nodeId: string | null) => void;
  initialNodeId: string | null;
  firstNodeId?: string;
  secondNodeId?: string;
}

export default function GraphWalkthrough({ 
  onComplete, 
  onSelectNode, 
  initialNodeId, 
  firstNodeId, 
  secondNodeId 
}: GraphWalkthroughProps) {
  const { setOpen } = useSidebar();

  useEffect(() => {
    const steps: DriveStep[] = [
      {
        popover: {
          title: 'Welcome to IdeaMesh!',
          description: "Let's take a quick tour of the interface to get you started.",
        },
      },
      {
        popover: {
          title: 'Your Knowledge Canvas',
          description: 'This is where all your ideas, or "nodes", will live. You can pan by clicking and dragging the background, and zoom with your mouse wheel.',
          side: 'top',
          align: 'center',
        },
      }
    ];

    if (firstNodeId) {
      steps.push({
        element: `#node-${firstNodeId}`,
        popover: {
          title: 'This is a Node',
          description: 'Nodes represent individual ideas. You can click and drag them around the canvas. Let\'s see what happens when you select one.',
        },
        onNextClick: ({ next }) => {
          onSelectNode(firstNodeId);
          setOpen(true);
          // Give sidebar time to animate open
          setTimeout(() => {
            next();
          }, 400);
        }
      });
    }

    steps.push({
      element: '[data-sidebar="sidebar"]',
      popover: {
        title: 'The Control Panel',
        description: "Selecting a node opens the Control Panel, where you can edit its title, content, color, and other properties. To close it, just click the 'X' or click on the canvas background.",
        side: 'left',
        align: 'center',
      },
       onNextClick: ({ next }) => {
        onSelectNode(null);
        setOpen(false);
        // Give sidebar time to animate closed
        setTimeout(() => {
          next();
        }, 400);
      }
    });

    if (secondNodeId) {
       steps.push({
        element: `#node-${secondNodeId}`,
        popover: {
          title: 'Creating Links',
          description: "To connect ideas, hover over a node and drag the small link icon that appears to another node. This creates a directional link, or 'edge', between them.",
        },
      });
    }

    steps.push(
      {
        element: '#add-node-button',
        popover: {
          title: 'Add New Nodes',
          description: 'Click this button to create a new node and add a fresh idea to your graph.',
          side: 'left',
          align: 'start'
        },
      },
      {
        element: '#ai-chat-button',
        popover: {
          title: 'GraphAI Assistant',
          description: 'Click here to open the AI chat panel. You can ask the AI to create nodes, link ideas, or even build entire systems for you!',
          side: 'right',
          align: 'start'
        },
      },
      {
        element: '#ai-actions-bar',
        popover: {
          title: 'Quick AI Actions',
          description: "This menu contains AI actions to summarize the entire graph, get new link suggestions, or automatically rearrange the layout for clarity. It adapts for mobile and desktop.",
          side: 'bottom',
          align: 'start'
        },
      },
      {
        popover: {
          title: 'You\'re All Set!',
          description: "That's it for the basics. Now it's your turn to start creating and connecting your ideas. Enjoy!",
        },
      }
    );

    const driverObj = driver({
      allowClose: false,
      showProgress: true,
      popoverClass: 'driverjs-theme',
      steps: steps.filter(Boolean),
      onDoneClick: () => {
        driverObj.destroy();
        onComplete();
      },
      onCloseClick: () => {
        driverObj.destroy();
        onComplete();
      },
    });

    driverObj.drive();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
