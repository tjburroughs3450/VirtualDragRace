var SignalProcessing = {
    compress_samples: function(samples, window_len) {
        var result = [];
        var total = 0.0; 
      
        for (var i = 1; i <= samples.length; i++) {
            total += samples[i - 1];
        
            if (i % window_len == 0) {
                result.push(total / window_len);
                total = 0;
            }
        
            else if (i == samples.length) {
                result.push(total / (i % window_len))
            }
      }
      
      return result;
    },

    // So we shouldn't have ever combined these...
    isolate_dimensions: function(combined_samples) {
        var result = {
            x: [],
            y: []
        };

        for (var i = 0; i < combined_samples.length; i++) {
            result.x.push(combined_samples[i].x);
            result.y.push(combined_samples[i].y);
        }

        return result;
    },

    combine_dimensions: function(isolated_samples) {
        var result = [];

        for (var i = 0; i < isolated_samples.x.length; i++) {
            result.push({x: isolated_samples.x[i], y: isolated_samples.y[i]});
        }

        return result;
    }
};