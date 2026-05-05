```ucm
scratch/main> project.create build
build/main> lib.install @frawa/typed-json/releases/0.12.1
build/main> lib.install @dfreeman/warp/
build/main> ls lib
```

```ucm
build/main> load scratch.u
build/main> update
build/main> run buildWasm
```
