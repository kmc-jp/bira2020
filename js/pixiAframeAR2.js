window.addEventListener('load', function () {
	var marker2 = document.getElementById('marker2');
	if(!marker2){ marker2 = document.querySelector('a-marker-camera'); }
	var camera = document.querySelector("a-entity[camera]");
	if(!camera){ camera = document.querySelector("a-marker-camera"); }
	camera = camera.components.camera.camera;

	//画面の回転フラグ
	var orientationchanged = false;
	//マーカーに対しての直立フラグ
	var stand_mode = false;

	var models2 = [];
	var app2 = new PIXI.Application(0, 0, { transparent: true });
	loadAssets().then(addModel).then(addPlane);

	function loadAssets() {
		//モーションの設定
		function setMotion(model, resources, x, y, resolve, reject){
			if (model == null){ reject(); }

			//基本モーション
			var motions = [];
			var animation = LIVE2DCUBISMFRAMEWORK.Animation;
			var override = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
			motions.push(animation.fromMotion3Json(resources['motion1'].data));
			motions.push(animation.fromMotion3Json(resources['motion2'].data));
			motions.push(animation.fromMotion3Json(resources['motion3'].data));
			model.motions = motions;
			model.animator.addLayer("breath", override, 1);
			model.animator.addLayer("blink", override, 1);
			//ランダムでモーション再生
			//var rand = Math.floor(Math.random() * model.motions.length);
			//model.animator.getLayer("motion").play(model.motions[rand]);
			
			// 呼吸モーション
			var breath_l = model.animator.getLayer("breath");
			breath_l.play(model.motions[0]);
			
			//クリックモーション
			var data = resources['motion1'].data;
			model.click_motion = animation.fromMotion3Json(data);

			//キャンバス内のモデルの位置
			model.pos_x = x;
			model.pos_y = y;

			models2.push(model);
			resolve();
		}
		//アセットの読み込み
		var xhrType = { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON };
		var p1 = new Promise(function (resolve, reject) {
			var loader = new PIXI.loaders.Loader();
			loader.add('model3', "assets/model/kanban/kanban.model3.json", xhrType);
			loader.add('motion1', "assets/model/kanban/Breathing.motion3.json", xhrType);
			loader.add('motion2', "assets/model/kanban/Blink1.motion3.json", xhrType);
			loader.add('motion3', "assets/model/kanban/Blink2.motion3.json", xhrType);
			loader.load(function (loader, resources) {
				var builder = new LIVE2DCUBISMPIXI.ModelBuilder();
				builder.buildFromModel3Json(loader, resources['model3'], complate);
				function complate(model){ setMotion(model, resources, 0.5, 0.5, resolve, reject); }
			});
		});
		return Promise.all([p1]);
	}
	function addModel() {
		//モデルの登録
		var p = new Promise(function (resolve, reject) {
			models2.forEach(function(model){
				app2.stage.addChild(model);
				app2.stage.addChild(model.masks);
			});
			app2.stage.renderable = false;
			app2.ticker.add(function (deltaTime) {
				models2.forEach(function(model){
					model.update(deltaTime);
					model.masks.update(app2.renderer);
				});
			});
			resolve();
		});
		return Promise.all([p]);
	}
	function addPlane() {
		var plane2 = document.createElement('a-plane');
		plane2.setAttribute('plane2', '');
		plane2.setAttribute('color', '#000');
		plane2.setAttribute('height', '10');
		plane2.setAttribute('width', '10');
		//マーカーを基準にしたモデルの相対位置
		plane2.setAttribute('position', '4 1 2');
		var stand = stand_mode ? '0 0 0' : '-90 0 0';
		plane2.setAttribute('rotation', stand);
		marker2.appendChild(plane2);

		plane2.object3D.front = new THREE.Object3D();
		plane2.object3D.front.position.set(0, 0, 0);
		plane2.object3D.add(plane2.object3D.front);

		var texture = new THREE.Texture(app2.view);
		texture.premultiplyAlpha = true;
		var material = new THREE.MeshBasicMaterial({});
		material.map = texture;
		material.metalness = 0;
		material.premultipliedAlpha = true;
		material.transparent = true;
		var mesh = null;

		AFRAME.registerComponent('plane2', {
			init: function () {
				mesh = this.el.getObject3D('mesh');
				mesh.material = material;
				this.timer = 0;
			},
			update: function(){
				var width = 1024;
				var height = 1024;
				app2.view.width = width + "px";
				app2.view.height = height + "px";
				app2.renderer.resize(width, height);

				models2.forEach(function(model){
					model.position = new PIXI.Point(width * model.pos_x, height * model.pos_y);
					model.scale = new PIXI.Point(width * 0.5, width * 0.5);
					model.masks.resize(app2.view.width, app2.view.height);
				});

				mesh.material.map.needsUpdate = true;
			},
			tick: function (time, timeDelta) {
				this.timer += timeDelta;
				if(marker2.object3D.visible){
					//画面が回転した直後（＝モデルの表示位置がずれている）でないなら描画する
					if(!orientationchanged){ app2.stage.renderable = true; }
					mesh.material.map.needsUpdate = true;

					//var pos = plane2.object3D.getWorldPosition();
					//var gaze = plane2.object3D.front.getWorldPosition();
					//gaze.sub(pos);
					model = models2[0];
					// まばたき止める
					var blink_l = model.animator.getLayer("blink");
					if(!blink_l.currentAnimation || blink_l.currentTime >= blink_l.currentAnimation.duration){
						blink_l.stop();
					}
					// まばたき
					if(this.timer > 3500){
						console.log(this.timer)
						this.timer = 0;
						var rand = Math.floor(Math.random() * 2) + 1;
						blink_l.stop();
						blink_l.play(model.motions[rand]);
					}
					/*
					models2.forEach(function(model){ 
						//視線追従モーションの更新
						//model.gaze = gaze;

						//ランダムでモーション再生
						
						var motion = model.animator.getLayer("motion");
						if(motion && motion.currentTime >= motion.currentAnimation.duration){
							var rand = Math.floor(Math.random() * model.motions.length);
							motion.stop();
							motion.play(model.motions[rand]);
						}
					});*/
				}else{
					//マーカーが外れたら描画を止める
					app2.stage.renderable = false;
					//マーカーが外れたら画面の回転フラグを折る
					//→マーカーの再検出時にモデルの表示位置が修正されるため
					orientationchanged = false;
				}
			}
		});
	}

	var click_event = function (e) {
		//クリックモーションの再生
		models2.forEach(function(model){ 
			var motion = model.animator.getLayer("motion");
			if(motion && model.click_motion){
				motion.stop();
				motion.play(model.click_motion);
			}
		});
	}
	//PCとスマホの選択イベントの振り分け
	if(window.ontouchstart === undefined){
		window.onclick = click_event;
	}else{
		window.ontouchstart = click_event;
	}
	window.onorientationchange = function (e) {
		if (e === void 0) { e = null; }
		//画面が回転するとモデルの表示位置がずれるため描画を止める
		app2.stage.renderable = false;
		//画面の回転フラグを立てる
		orientationchanged = true;
	}
});
