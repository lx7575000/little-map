const _ = {}

const {slice} = Array.prototype
const {toString} = Object.prototype
const nativeForEach = Array.prototype.forEach
const nativeIsArray = Array.isArray

_.extendMfargin = p => {
  let margin = p
  // 如果是纯数字，转为数组
  if (_.isNumber(margin)) {
    margin = [].concat(margin)
  }

  // 验证每个值是否的纯数字
  for (let i = 0, l = margin.length; i < l; i += 1) {
    if (!_.isNumber(margin[i])) {
      throw new Error('margin Values Must Be Number')
    }
  }

  // 展开为[a,b,c,d]形式
  if (margin.length === 1) {
    margin = [margin[0], margin[0], margin[0], margin[0]]
  } else if (margin.length === 2) {
    margin = [margin[0], margin[1], margin[0], margin[1]]
  } else if (margin.length === 3) {
    margin = [margin[0], margin[1], margin[2], margin[1]]
  }
  return margin
}

const each = _.each = function (obj, iterator, context) {
  if (obj == null) {
    return false;
  }
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0,
        l = obj.length; i < l; i++) {
      if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
        return false;
      }
    }
  } else {
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) {
          return false;
        }
      }
    }
  }
}
// 普通的extend方法，浅拷贝，不能到二级
_.extend = function (obj) {
  each(slice.call(arguments, 1), function (source) {
    for (var prop in source) {
      if (source[prop] !== void 0) {
        obj[prop] = source[prop];
      }
    }
  })
  return obj
}
// 允许二级的extend
_.extend2Lev = function (obj) {
  each(slice.call(arguments, 1), function (source) {
    for (var prop in source) {
      if (source[prop] !==
        void 0) {
        if (_.isObject(source[prop]) && _.isObject(obj[prop])) {
          _.extend(obj[prop], source[prop])
        } else {
          obj[prop] = source[prop]
        }
      }
    }
  })
  return obj
}

_.coverExtend2Lev = function (obj) {
  each(slice.call(arguments, 1), function (source) {
    for (var prop in source) {
      if (source[prop] !==
        void 0) {
        if (_.isObject(source[prop]) && _.isObject(obj[prop])) {
          _.coverExtend(obj[prop], source[prop])
        } else {
          obj[prop] = source[prop]
        }
      }
    }
  })
  return obj
}
// 如果已经有的属性不覆盖,如果没有的属性加进来
_.coverExtend = function (obj) {
  each(slice.call(arguments, 1), function (source) {
    for (var prop in source) {
      if (source[prop] !==
        void 0 && obj[prop] ===
        void 0) {
        obj[prop] = source[prop]
      }
    }
  })
  return obj
}

_.isNumber = obj => typeof obj === 'number' && !Number.isNaN(obj)

_.extendMargin = p => {
  let margin = p
  // 如果是纯数字，转为数组
  if (_.isNumber(margin)) {
    margin = [].concat(margin)
  }

  // 验证每个值是否的纯数字
  for (let i = 0, l = margin.length; i < l; i += 1) {
    if (!_.isNumber(margin[i])) {
      throw new Error('margin Values Must Be Number')
    }
  }

  // 展开为[a,b,c,d]形式
  if (margin.length === 1) {
    margin = [margin[0], margin[0], margin[0], margin[0]]
  } else if (margin.length === 2) {
    margin = [margin[0], margin[1], margin[0], margin[1]]
  } else if (margin.length === 3) {
    margin = [margin[0], margin[1], margin[2], margin[1]]
  }
  return margin
}

_.isObject = function (obj) {
  return (toString.call(obj) == '[object Object]') && (obj != null);
};

_.isEmptyObject = function (obj) {
  if (_.isObject(obj)) {
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }
  return false;
}


_.isUndefined = function (obj) {
  return obj === void 0
}

_.isString = function (obj) {
  return toString.call(obj) == '[object String]'
}

_.isArray = nativeIsArray || function (obj) {
  return toString.call(obj) === '[object Array]'
}

export default _
