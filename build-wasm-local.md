```ucm
scratch/main> project.create build
build/main> lib.install.local @frawa/typed-json/main
build/main> lib.install.local @dfreeman/warp/
build/main> ls lib
```

```ucm
build/main> load scratch.u
build/main> update
build/main> run buildWasm
```
