/******************************************************************************
 * Spine Runtimes Software License v2.5
 *
 * Copyright (c) 2013-2016, Esoteric Software
 * All rights reserved.
 *
 * You are granted a perpetual, non-exclusive, non-sublicensable, and
 * non-transferable license to use, install, execute, and perform the Spine
 * Runtimes software and derivative works solely for personal or internal
 * use. Without the written permission of Esoteric Software (see Section 2 of
 * the Spine Software License Agreement), you may not (a) modify, translate,
 * adapt, or develop new applications using the Spine Runtimes or otherwise
 * create derivative works or improvements of the Spine Runtimes or (b) remove,
 * delete, alter, or obscure any trademarks or any copyright, trademark, patent,
 * or other intellectual property or proprietary rights notices on or in the
 * Software, including any copy thereof. Redistributions in binary or source
 * form must include this license and terms.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS INTERRUPTION, OR LOSS OF
 * USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/

module spine {
	export class AtlasAttachmentLoader implements AttachmentLoader {
		
		// TGE CHANGE
		//atlas: TextureAtlas;

		constructor () {

		}

		/** @return May be null to not load an attachment. */
		newRegionAttachment (skin: Skin, name: string, path: string, uid: string): RegionAttachment {
			
			// TGE CHANGE
			//let region = this.atlas.findRegion(path);
			var flatName = name.replace(/\//g, "_"); // TGE trims forward slashes so we need to flatten them out in the converter
			let spriteInfo: any = TGE.AssetManager.Get(flatName + "_" + uid);
            let spriteSheet: CanvasImageSource = spriteInfo.spriteSheet;
            let drawWidth = typeof(spriteInfo.drawWidth)==="number" ? spriteInfo.drawWidth : spriteInfo.width;
            let drawHeight = typeof(spriteInfo.drawHeight)==="number" ? spriteInfo.drawHeight : spriteInfo.height;
			let region = new TextureRegion();
			region.uid = uid;
            region.name = name;
            region.x = spriteInfo.x;
            region.y = spriteInfo.y;
            //region.u = spriteInfo.x / (spriteSheet.width as number);
            //region.v = spriteInfo.y / (spriteSheet.height as number);
            //region.u2 = (spriteInfo.x + drawWidth) / (spriteSheet.width as number);
            //region.v2 = (spriteInfo.y + drawHeight) / (spriteSheet.height as number);
            region.width = drawWidth;
            region.height = drawHeight;
            region.rotate = false;
            region.offsetX = typeof(spriteInfo.offsetX)==="number" ? spriteInfo.offsetX : 0;
            region.offsetY = typeof(spriteInfo.offsetY)==="number" ? spriteInfo.offsetY : 0;
            region.originalWidth = spriteInfo.width;
            region.originalHeight = spriteInfo.height;
			
			if (region == null) throw new Error("Region not found in atlas: " + path + " (region attachment: " + name + ")");
			region.renderObject = region;
			let attachment = new RegionAttachment(name);
			attachment.setRegion(region);
			return attachment;
		}

		/** @return May be null to not load an attachment. */
		/*newMeshAttachment (skin: Skin, name: string, path: string, uid: string) : MeshAttachment {
			let region = this.atlas.findRegion(path);
			if (region == null) throw new Error("Region not found in atlas: " + path + " (mesh attachment: " + name + ")");
			region.renderObject = region;
			let attachment = new MeshAttachment(name);
			attachment.region = region;
			return attachment;
		}*/

		/** @return May be null to not load an attachment. */
		newBoundingBoxAttachment (skin: Skin, name: string) : BoundingBoxAttachment {
			return new BoundingBoxAttachment(name);
		}

		/** @return May be null to not load an attachment */
		/*newPathAttachment (skin: Skin, name: string): PathAttachment {
			return new PathAttachment(name);
		}*/

		newPointAttachment(skin: Skin, name: string): PointAttachment {
			return new PointAttachment(name);
		}

		/*newClippingAttachment(skin: Skin, name: string): ClippingAttachment {
			return new ClippingAttachment(name);
		}*/
	}
}
