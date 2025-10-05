// Alternative approach: Serialize functions as references
export class StateSerializer {
  // Serialize state with function references
  static serialize(state: any): string {
    const serialized = JSON.stringify(state, (key, value) => {
      if (typeof value === 'function') {
        // Store function reference instead of the function itself
        return {
          __isFunction: true,
          __functionName: value.name || 'anonymous',
          __functionLocation: (value as any).__functionLocation || 'unknown'
        };
      }
      return value;
    });
    return serialized;
  }

  // Deserialize state and reconstruct functions
  static deserialize(serializedState: string, functionMap: Record<string, Function>): any {
    const parsed = JSON.parse(serializedState);
    
    return this.reconstructFunctions(parsed, functionMap);
  }

  // Recursively reconstruct functions
  private static reconstructFunctions(obj: any, functionMap: Record<string, Function>): any {
    if (obj && typeof obj === 'object') {
      if (obj.__isFunction && obj.__functionName) {
        // Reconstruct function from map
        return functionMap[obj.__functionName] || (() => {});
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => this.reconstructFunctions(item, functionMap));
      }
      
      const reconstructed: any = {};
      for (const [key, value] of Object.entries(obj)) {
        reconstructed[key] = this.reconstructFunctions(value, functionMap);
      }
      return reconstructed;
    }
    
    return obj;
  }
}

// Function map for layer components
export const LAYER_COMPONENT_MAP: Record<string, Function> = {
  'TextLayer': () => import('@lidojs/design-editor').then(m => m.TextLayer),
  'RootLayer': () => import('@lidojs/design-editor').then(m => m.RootLayer),
  'SimpleFrameLayer': () => import('@lidojs/design-editor').then(m => m.SimpleFrameLayer),
  'ImageLayer': () => import('@lidojs/design-editor').then(m => m.ImageLayer),
  'ShapeLayer': () => import('@lidojs/design-editor').then(m => m.ShapeLayer),
  // Add more layer types as needed
};
